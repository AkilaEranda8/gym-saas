// Deprecated: superseded by MaintenanceRequest.java (V20 schema)
package com.gymapp.modules.equipment;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class EquipmentMaintenance extends TenantEntity {

    @Column(name = "equipment_id", nullable = false)
    private UUID equipmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MaintenanceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(columnDefinition = "text")
    private String description;

    @Column(precision = 8, scale = 2)
    private BigDecimal cost;

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    public enum MaintenanceType   { SCHEDULED, CORRECTIVE, PREVENTIVE, INSPECTION }
    public enum MaintenanceStatus { SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED }
}
