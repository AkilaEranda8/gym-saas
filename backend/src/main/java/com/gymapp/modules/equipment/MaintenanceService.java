package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.modules.equipment.enums.MaintenanceLogAction;
import com.gymapp.modules.equipment.enums.MaintenancePriority;
import com.gymapp.modules.equipment.enums.MaintenanceStatus;
import com.gymapp.modules.notification.NotificationService;
import com.gymapp.modules.notification.enums.NotificationType;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRequestRepository requestRepository;
    private final MaintenanceLogRepository     logRepository;
    private final EquipmentRepository          equipmentRepository;
    private final EquipmentService             equipmentService;
    private final NotificationService          notificationService;
    private final CurrentUser                  currentUser;

    public PageResponse<MaintenanceRequestDTO> getAll(int page, int size,
                                                       String equipmentId, MaintenanceStatus status,
                                                       MaintenancePriority priority,
                                                       LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        UUID eqId  = equipmentId != null ? UUID.fromString(equipmentId) : null;
        var pg = requestRepository.findAllByGymIdWithFilters(gymId, eqId, status, priority, from, to,
            PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.from(pg.map(r -> {
            Equipment eq = equipmentRepository.findById(r.getEquipmentId()).orElse(null);
            return equipmentService.toMaintenanceDTO(r, eq != null ? eq.getName() : null, eq != null ? eq.getLocation() : null);
        }));
    }

    public MaintenanceRequestDetailDTO getById(String id) {
        UUID gymId = TenantContext.getGymId();
        MaintenanceRequest r = requestRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Maintenance request not found"));
        Equipment eq = equipmentRepository.findById(r.getEquipmentId()).orElse(null);
        List<MaintenanceLogDTO> logs = logRepository.findAllByRequestIdOrderByCreatedAtDesc(r.getId())
            .stream().map(this::toLogDTO).toList();
        return new MaintenanceRequestDetailDTO(
            r.getId(), r.getGymId(), r.getBranchId(), r.getEquipmentId(),
            eq != null ? eq.getName() : null, eq != null ? eq.getLocation() : null,
            r.getRequestNumber(), r.getTitle(), r.getDescription(),
            r.getPriority(), r.getPriority() != null ? r.getPriority().getColor() : null,
            r.getStatus(), r.getReportedBy(), r.getReportedByName(),
            r.getAssignedTo(), r.getAssignedToName(),
            r.getEstimatedCostLkr(), r.getActualCostLkr(),
            r.getDueDate(), r.getStartedAt(), r.getResolvedAt(),
            r.getResolutionNotes(), r.getCreatedAt(), r.isOverdue(),
            logs, eq != null ? equipmentService.toDTO(eq, gymId) : null
        );
    }

    @Transactional
    public MaintenanceRequestDTO create(CreateMaintenanceRequest req) {
        UUID gymId = TenantContext.getGymId();
        UUID eqId  = UUID.fromString(req.equipmentId());

        Equipment eq = equipmentRepository.findByIdAndGymId(eqId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));

        int year  = LocalDate.now().getYear();
        long cnt  = requestRepository.countByGymIdAndYear(gymId, year);
        String reqNum = String.format("MNT-%d-%05d", year, cnt + 1);

        MaintenanceRequest r = new MaintenanceRequest();
        r.setGymId(gymId);
        r.setEquipmentId(eqId);
        r.setRequestNumber(reqNum);
        r.setTitle(req.title());
        r.setDescription(req.description());
        r.setPriority(req.priority());
        r.setStatus(MaintenanceStatus.OPEN);
        r.setReportedBy(currentUser.getUserId());
        r.setReportedByName(currentUser.getEmail());
        r.setAssignedTo(req.assignedTo());
        r.setAssignedToName(req.assignedToName());
        r.setEstimatedCostLkr(req.estimatedCostLkr());
        r.setDueDate(req.dueDate());

        MaintenanceRequest saved = requestRepository.save(r);

        addLog(saved.getId(), gymId, MaintenanceLogAction.STATUS_CHANGE,
            null, MaintenanceStatus.OPEN.name(), "Maintenance request created");

        if (req.priority() == MaintenancePriority.CRITICAL || req.priority() == MaintenancePriority.HIGH) {
            try {
                notificationService.broadcastToGym(gymId,
                    "🔧 " + req.priority().name() + " Maintenance: " + eq.getName(),
                    req.title() + " — Priority: " + req.priority().name(),
                    NotificationType.MAINTENANCE_ALERT);
            } catch (Exception ex) { log.warn("Notify failed: {}", ex.getMessage()); }
        }

        if (eq.getStatus() == com.gymapp.modules.equipment.enums.EquipmentStatus.OPERATIONAL
            && req.priority() == MaintenancePriority.CRITICAL) {
            eq.setStatus(com.gymapp.modules.equipment.enums.EquipmentStatus.OUT_OF_ORDER);
            equipmentRepository.save(eq);
        }

        return equipmentService.toMaintenanceDTO(saved, eq.getName(), eq.getLocation());
    }

    @Transactional
    public MaintenanceRequestDTO update(String id, UpdateMaintenanceRequest req) {
        UUID gymId = TenantContext.getGymId();
        MaintenanceRequest r = requestRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Maintenance request not found"));

        if (req.title()       != null) r.setTitle(req.title());
        if (req.description() != null) r.setDescription(req.description());
        if (req.priority()    != null) r.setPriority(req.priority());
        if (req.assignedTo()  != null) { r.setAssignedTo(req.assignedTo()); r.setAssignedToName(req.assignedToName()); }
        if (req.estimatedCostLkr() != null) r.setEstimatedCostLkr(req.estimatedCostLkr());
        if (req.dueDate()     != null) r.setDueDate(req.dueDate());

        MaintenanceRequest saved = requestRepository.save(r);
        Equipment eq = equipmentRepository.findById(r.getEquipmentId()).orElse(null);
        return equipmentService.toMaintenanceDTO(saved, eq != null ? eq.getName() : null, eq != null ? eq.getLocation() : null);
    }

    @Transactional
    public MaintenanceRequestDTO updateStatus(String id, UpdateMaintenanceStatusRequest req) {
        UUID gymId = TenantContext.getGymId();
        MaintenanceRequest r = requestRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Maintenance request not found"));

        String oldStatus = r.getStatus().name();
        r.setStatus(req.status());

        switch (req.status()) {
            case IN_PROGRESS -> r.setStartedAt(LocalDateTime.now());
            case RESOLVED    -> { r.setResolvedAt(LocalDateTime.now());
                                  if (req.resolutionNotes() != null) r.setResolutionNotes(req.resolutionNotes());
                                  if (req.actualCostLkr()   != null) r.setActualCostLkr(req.actualCostLkr()); }
            case CLOSED, CANCELLED -> r.setClosedAt(LocalDateTime.now());
            default -> {}
        }

        MaintenanceRequest saved = requestRepository.save(r);
        addLog(saved.getId(), gymId, MaintenanceLogAction.STATUS_CHANGE,
            oldStatus, req.status().name(), req.comment());

        if (req.actualCostLkr() != null) {
            addLog(saved.getId(), gymId, MaintenanceLogAction.COST_UPDATE,
                null, null, "Actual cost: LKR " + req.actualCostLkr());
        }

        if (req.status() == MaintenanceStatus.RESOLVED) {
            Equipment eq = equipmentRepository.findById(r.getEquipmentId()).orElse(null);
            if (eq != null && eq.getStatus() != com.gymapp.modules.equipment.enums.EquipmentStatus.RETIRED) {
                eq.setStatus(com.gymapp.modules.equipment.enums.EquipmentStatus.OPERATIONAL);
                equipmentRepository.save(eq);
            }
        }

        Equipment eq = equipmentRepository.findById(r.getEquipmentId()).orElse(null);
        return equipmentService.toMaintenanceDTO(saved, eq != null ? eq.getName() : null, eq != null ? eq.getLocation() : null);
    }

    @Transactional
    public MaintenanceLogDTO addComment(String id, AddMaintenanceCommentRequest req) {
        UUID gymId = TenantContext.getGymId();
        MaintenanceRequest r = requestRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Maintenance request not found"));
        MaintenanceLog log = addLog(r.getId(), gymId, MaintenanceLogAction.COMMENT,
            null, null, req.comment());
        if (req.costLkr() != null) {
            log.setCostLkr(req.costLkr());
            logRepository.save(log);
        }
        return toLogDTO(log);
    }

    @Transactional
    public void delete(String id) {
        UUID gymId = TenantContext.getGymId();
        MaintenanceRequest r = requestRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Maintenance request not found"));
        if (r.getStatus() == MaintenanceStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot delete in-progress maintenance request");
        }
        requestRepository.softDelete(r.getId(), gymId, LocalDateTime.now());
    }

    public MaintenanceSummaryDTO getSummary() {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime now = LocalDateTime.now();
        long open       = requestRepository.countByGymIdAndStatus(gymId, MaintenanceStatus.OPEN);
        long inProgress = requestRepository.countByGymIdAndStatus(gymId, MaintenanceStatus.IN_PROGRESS);
        long resolved   = requestRepository.findAllByGymIdWithFilters(gymId, null, MaintenanceStatus.RESOLVED,
            null, LocalDate.now().withDayOfMonth(1), LocalDate.now(), PageRequest.of(0, 1)).getTotalElements();
        long critical   = requestRepository.countByGymIdAndPriority(gymId, MaintenancePriority.CRITICAL);
        Long totalCost  = requestRepository.sumCostByGymIdAndResolvedAtBetween(gymId, monthStart, now);
        Double avgDays  = requestRepository.avgResolutionDays(gymId, monthStart, now);
        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (MaintenancePriority p : MaintenancePriority.values()) {
            byPriority.put(p.name(), requestRepository.countByGymIdAndPriority(gymId, p));
        }
        return new MaintenanceSummaryDTO(open, inProgress, resolved, critical, avgDays, totalCost, List.of(), byPriority);
    }

    private MaintenanceLog addLog(UUID requestId, UUID gymId, MaintenanceLogAction action,
                                   String oldStatus, String newStatus, String comment) {
        MaintenanceLog log = new MaintenanceLog();
        log.setGymId(gymId);
        log.setRequestId(requestId);
        log.setLoggedBy(currentUser.getUserId());
        log.setLoggedByName(currentUser.getEmail());
        log.setAction(action);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setComment(comment);
        return logRepository.save(log);
    }

    private MaintenanceLogDTO toLogDTO(MaintenanceLog l) {
        return new MaintenanceLogDTO(l.getId(), l.getRequestId(), l.getLoggedBy(), l.getLoggedByName(),
            l.getAction(), l.getOldStatus(), l.getNewStatus(), l.getComment(), l.getCostLkr(), l.getCreatedAt());
    }
}
