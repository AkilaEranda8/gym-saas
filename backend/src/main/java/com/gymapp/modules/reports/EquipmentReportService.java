package com.gymapp.modules.reports;

import com.gymapp.modules.equipment.EquipmentRepository;
import com.gymapp.modules.equipment.MaintenanceRequestRepository;
import com.gymapp.modules.equipment.enums.EquipmentStatus;
import com.gymapp.modules.equipment.enums.MaintenancePriority;
import com.gymapp.modules.equipment.enums.MaintenanceStatus;
import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service("reportsEquipmentReportService")
@RequiredArgsConstructor
public class EquipmentReportService {

    private final EquipmentRepository         equipmentRepository;
    private final MaintenanceRequestRepository maintenanceRepository;

    @Transactional(readOnly = true)
    public EquipmentReportDTO generate(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo   = to.atTime(23, 59, 59);

        long total       = equipmentRepository.countByGymIdAndDeletedAtIsNull(gymId);
        long operational = equipmentRepository.countByGymIdAndStatus(gymId, EquipmentStatus.OPERATIONAL);
        long maintenance = equipmentRepository.countByGymIdAndStatus(gymId, EquipmentStatus.MAINTENANCE);
        long outOfOrder  = equipmentRepository.countByGymIdAndStatus(gymId, EquipmentStatus.OUT_OF_ORDER);
        long overdueServ = equipmentRepository.countServiceOverdueByGymId(gymId, LocalDate.now());

        long openReqs    = maintenanceRepository.countByGymIdAndStatus(gymId, MaintenanceStatus.OPEN)
                         + maintenanceRepository.countByGymIdAndStatus(gymId, MaintenanceStatus.IN_PROGRESS);
        long critical    = maintenanceRepository.countByGymIdAndPriority(gymId, MaintenancePriority.CRITICAL);

        Long costRaw     = maintenanceRepository.sumCostByGymIdAndResolvedAtBetween(gymId, dtFrom, dtTo);
        long totalCost   = costRaw != null ? costRaw : 0L;

        Double avgDays   = maintenanceRepository.avgResolutionDays(gymId, dtFrom, dtTo);
        double avgResolution = avgDays != null ? Math.round(avgDays * 100.0) / 100.0 : 0.0;

        return new EquipmentReportDTO(
            from, to, total, operational, maintenance, outOfOrder,
            overdueServ, totalCost, avgResolution,
            openReqs, critical,
            List.of(), List.of()
        );
    }
}
