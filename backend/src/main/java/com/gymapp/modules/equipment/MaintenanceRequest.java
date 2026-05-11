package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.enums.MaintenancePriority;
import com.gymapp.modules.equipment.enums.MaintenanceStatus;
import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "maintenance_requests")
@SQLRestriction("deleted_at IS NULL")
public class MaintenanceRequest extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "equipment_id", nullable = false)
    private UUID equipmentId;

    @Column(name = "request_number", nullable = false, length = 20, unique = true)
    private String requestNumber;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MaintenancePriority priority = MaintenancePriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MaintenanceStatus status = MaintenanceStatus.OPEN;

    @Column(name = "reported_by", nullable = false, length = 100)
    private String reportedBy;

    @Column(name = "reported_by_name", length = 100)
    private String reportedByName;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "assigned_to_name", length = 100)
    private String assignedToName;

    @Column(name = "estimated_cost_lkr")
    private Long estimatedCostLkr;

    @Column(name = "actual_cost_lkr")
    private Long actualCostLkr;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "resolution_notes", columnDefinition = "text")
    private String resolutionNotes;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    private List<MaintenanceLog> logs = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", insertable = false, updatable = false)
    private Equipment equipment;

    @Transient
    public boolean isOverdue() {
        return dueDate != null && dueDate.isBefore(LocalDate.now())
               && status != MaintenanceStatus.RESOLVED
               && status != MaintenanceStatus.CLOSED
               && status != MaintenanceStatus.CANCELLED;
    }
}
