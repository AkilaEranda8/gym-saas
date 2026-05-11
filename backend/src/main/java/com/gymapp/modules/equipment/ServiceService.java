package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.modules.equipment.enums.ServiceType;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceScheduleRepository  scheduleRepository;
    private final ServiceRecordRepository    recordRepository;
    private final EquipmentRepository        equipmentRepository;
    private final EquipmentService           equipmentService;
    private final CurrentUser                currentUser;

    public List<ServiceScheduleDTO> getSchedulesByEquipment(String equipmentId) {
        UUID eqId = UUID.fromString(equipmentId);
        Equipment eq = equipmentRepository.findById(eqId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));
        return scheduleRepository.findActiveByEquipmentIdOrderByDate(eqId)
            .stream().map(s -> equipmentService.toScheduleDTO(s, eq.getName())).toList();
    }

    public List<ServiceScheduleDTO> getUpcomingSchedules(int days) {
        UUID gymId = TenantContext.getGymId();
        LocalDate today = LocalDate.now();
        return scheduleRepository.findAllByGymIdAndNextServiceDateBetween(gymId, today, today.plusDays(days))
            .stream()
            .sorted(Comparator.comparing(ServiceSchedule::getNextServiceDate))
            .map(s -> {
                Equipment eq = equipmentRepository.findById(s.getEquipmentId()).orElse(null);
                return equipmentService.toScheduleDTO(s, eq != null ? eq.getName() : null);
            }).toList();
    }

    @Transactional
    public ServiceScheduleDTO createSchedule(CreateServiceScheduleRequest req) {
        UUID gymId = TenantContext.getGymId();
        UUID eqId  = UUID.fromString(req.equipmentId());
        Equipment eq = equipmentRepository.findByIdAndGymId(eqId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));

        ServiceSchedule s = new ServiceSchedule();
        s.setGymId(gymId);
        s.setEquipmentId(eqId);
        s.setServiceType(req.serviceType());
        s.setFrequencyDays(req.frequencyDays());
        s.setNextServiceDate(req.nextServiceDate());
        s.setAssignedTo(req.assignedTo());
        s.setServiceProvider(req.serviceProvider());
        s.setEstimatedCostLkr(req.estimatedCostLkr());
        s.setNotes(req.notes());
        s.setIsActive(true);

        return equipmentService.toScheduleDTO(scheduleRepository.save(s), eq.getName());
    }

    @Transactional
    public void deleteSchedule(String id) {
        UUID gymId = TenantContext.getGymId();
        ServiceSchedule s = scheduleRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Service schedule not found"));
        s.setIsActive(false);
        scheduleRepository.save(s);
    }

    public PageResponse<ServiceRecordDTO> getRecordsByEquipment(String equipmentId, int page, int size) {
        UUID eqId = UUID.fromString(equipmentId);
        Equipment eq = equipmentRepository.findById(eqId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));
        var pg = recordRepository.findAllByEquipmentIdOrderByServiceDateDesc(eqId,
            PageRequest.of(page, size, Sort.by("serviceDate").descending()));
        return PageResponse.from(pg.map(r -> equipmentService.toRecordDTO(r, eq.getName())));
    }

    @Transactional
    public ServiceRecordDTO createRecord(CreateServiceRecordRequest req) {
        UUID gymId = TenantContext.getGymId();
        UUID eqId  = UUID.fromString(req.equipmentId());
        Equipment eq = equipmentRepository.findByIdAndGymId(eqId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));

        ServiceRecord r = new ServiceRecord();
        r.setGymId(gymId);
        r.setEquipmentId(eqId);
        if (req.scheduleId() != null) r.setScheduleId(UUID.fromString(req.scheduleId()));
        r.setServiceType(req.serviceType());
        r.setServiceDate(req.serviceDate());
        r.setPerformedBy(req.performedBy() != null ? req.performedBy() : currentUser.getEmail());
        r.setServiceProvider(req.serviceProvider());
        r.setCostLkr(req.costLkr());
        r.setDurationHours(req.durationHours());
        r.setConditionBefore(req.conditionBefore());
        r.setConditionAfter(req.conditionAfter());
        if (req.partsReplaced() != null) r.setPartsReplaced(String.join(",", req.partsReplaced()));
        r.setDescription(req.description());
        r.setNotes(req.notes());
        r.setNextServiceDate(req.nextServiceDate());
        r.setInvoiceUrl(req.invoiceUrl());

        ServiceRecord saved = recordRepository.save(r);

        eq.setLastServiceDate(req.serviceDate());
        if (req.nextServiceDate() != null) {
            eq.setNextServiceDate(req.nextServiceDate());
        } else if (eq.getServiceIntervalDays() != null) {
            eq.setNextServiceDate(req.serviceDate().plusDays(eq.getServiceIntervalDays()));
        }
        if (req.conditionAfter() != null) {
            try { eq.setCondition(com.gymapp.modules.equipment.enums.EquipmentCondition.valueOf(req.conditionAfter())); }
            catch (Exception ignored) {}
        }
        equipmentRepository.save(eq);

        if (req.scheduleId() != null) {
            scheduleRepository.findById(UUID.fromString(req.scheduleId())).ifPresent(sc -> {
                sc.setLastServiceDate(req.serviceDate());
                sc.setNextServiceDate(eq.getNextServiceDate());
                scheduleRepository.save(sc);
            });
        }

        return equipmentService.toRecordDTO(saved, eq.getName());
    }

    public Map<String, Object> getServiceCostReport(int year) {
        UUID gymId = TenantContext.getGymId();
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to   = LocalDate.of(year, 12, 31);
        Long totalCost = recordRepository.sumCostByGymIdAndServiceDateBetween(gymId, from, to);
        List<ServiceRecord> records = recordRepository.findAllByGymIdAndServiceDateBetween(gymId, from, to);
        Map<String, Long> costByType = records.stream()
            .filter(r -> r.getCostLkr() != null)
            .collect(Collectors.groupingBy(r -> r.getServiceType().name(), Collectors.summingLong(ServiceRecord::getCostLkr)));
        return Map.of("year", year, "totalCostLkr", totalCost != null ? totalCost : 0L, "costByType", costByType);
    }
}
