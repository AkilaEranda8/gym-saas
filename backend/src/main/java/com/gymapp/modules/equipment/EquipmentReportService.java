package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.modules.equipment.enums.EquipmentStatus;
import com.gymapp.modules.equipment.enums.MaintenancePriority;
import com.gymapp.modules.equipment.enums.MaintenanceStatus;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquipmentReportService {

    private final EquipmentRepository          equipmentRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final ServiceRecordRepository      serviceRecordRepository;
    private final EquipmentService             equipmentService;

    public byte[] exportEquipmentCsv() {
        UUID gymId = TenantContext.getGymId();
        List<Equipment> all = equipmentRepository.findAllByGymIdWithFilters(
            gymId, null, null, null, null,
            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)).getContent();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter pw = new PrintWriter(baos)) {
            pw.println("ID,Name,Brand,Model,Serial Number,Location,Status,Condition,Last Service,Next Service,Purchase Price (LKR),Notes");
            for (Equipment e : all) {
                pw.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    e.getId(), csv(e.getName()), csv(e.getBrand()), csv(e.getModel()),
                    csv(e.getSerialNumber()), csv(e.getLocation()),
                    e.getStatus(), e.getCondition(),
                    e.getLastServiceDate() != null ? e.getLastServiceDate() : "",
                    e.getNextServiceDate() != null ? e.getNextServiceDate() : "",
                    e.getPurchasePriceLkr() != null ? e.getPurchasePriceLkr() : "",
                    csv(e.getNotes()));
            }
        }
        return baos.toByteArray();
    }

    public byte[] exportMaintenanceCsv(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        var page = maintenanceRepository.findAllByGymIdWithFilters(gymId, null, null, null, from, to,
            org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter pw = new PrintWriter(baos)) {
            pw.println("Request#,Equipment,Title,Priority,Status,Reported By,Assigned To,Est Cost (LKR),Actual Cost (LKR),Due Date,Resolved At,Created At");
            for (MaintenanceRequest r : page.getContent()) {
                Equipment eq = equipmentRepository.findById(r.getEquipmentId()).orElse(null);
                pw.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    r.getRequestNumber(),
                    eq != null ? csv(eq.getName()) : "",
                    csv(r.getTitle()), r.getPriority(), r.getStatus(),
                    csv(r.getReportedByName()), csv(r.getAssignedToName()),
                    r.getEstimatedCostLkr() != null ? r.getEstimatedCostLkr() : "",
                    r.getActualCostLkr()    != null ? r.getActualCostLkr()    : "",
                    r.getDueDate()          != null ? r.getDueDate()          : "",
                    r.getResolvedAt()       != null ? r.getResolvedAt()       : "",
                    r.getCreatedAt());
            }
        }
        return baos.toByteArray();
    }

    public byte[] exportServiceCostCsv(int year) {
        UUID gymId = TenantContext.getGymId();
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to   = LocalDate.of(year, 12, 31);
        List<ServiceRecord> records = serviceRecordRepository.findAllByGymIdAndServiceDateBetween(gymId, from, to);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter pw = new PrintWriter(baos)) {
            pw.println("Equipment ID,Service Type,Service Date,Performed By,Cost (LKR),Duration (hrs),Parts Replaced,Description");
            for (ServiceRecord r : records) {
                Equipment eq = equipmentRepository.findById(r.getEquipmentId()).orElse(null);
                pw.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
                    eq != null ? csv(eq.getName()) : r.getEquipmentId(),
                    r.getServiceType(), r.getServiceDate(),
                    csv(r.getPerformedBy()),
                    r.getCostLkr()      != null ? r.getCostLkr()      : "",
                    r.getDurationHours()!= null ? r.getDurationHours(): "",
                    csv(r.getPartsReplaced()), csv(r.getDescription()));
            }
        }
        return baos.toByteArray();
    }

    public Map<String, Object> getDashboardReport() {
        UUID gymId = TenantContext.getGymId();
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);

        long total      = equipmentRepository.countByGymIdAndDeletedAtIsNull(gymId);
        long overdue    = equipmentRepository.findServiceOverdue(gymId, today).size();
        long openMaint  = maintenanceRepository.countByGymIdAndStatus(gymId, MaintenanceStatus.OPEN);
        long critical   = maintenanceRepository.countByGymIdAndPriority(gymId, MaintenancePriority.CRITICAL);
        Long monthCost  = serviceRecordRepository.sumCostByGymIdAndServiceDateBetween(gymId, monthStart, today);
        Long maintCost  = maintenanceRepository.sumCostByGymIdAndResolvedAtBetween(gymId,
            monthStart.atStartOfDay(), today.plusDays(1).atStartOfDay());

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (EquipmentStatus s : EquipmentStatus.values()) {
            byStatus.put(s.name(), equipmentRepository.countByGymIdAndStatus(gymId, s));
        }

        return Map.of(
            "totalEquipment", total,
            "serviceOverdueCount", overdue,
            "openMaintenanceCount", openMaint,
            "criticalMaintenanceCount", critical,
            "monthlyServiceCostLkr", monthCost != null ? monthCost : 0L,
            "monthlyMaintenanceCostLkr", maintCost != null ? maintCost : 0L,
            "equipmentByStatus", byStatus
        );
    }

    private String csv(String val) {
        if (val == null) return "";
        return "\"" + val.replace("\"", "\"\"") + "\"";
    }
}
