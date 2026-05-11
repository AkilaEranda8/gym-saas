package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.enums.ServiceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "service_schedules")
public class ServiceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "equipment_id", nullable = false)
    private UUID equipmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false, length = 30)
    private ServiceType serviceType;

    @Column(name = "frequency_days", nullable = false)
    private Integer frequencyDays = 90;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "next_service_date", nullable = false)
    private LocalDate nextServiceDate;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "service_provider", length = 100)
    private String serviceProvider;

    @Column(name = "estimated_cost_lkr")
    private Long estimatedCostLkr;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Transient
    public long getDaysUntilService() {
        if (nextServiceDate == null) return Long.MAX_VALUE;
        return ChronoUnit.DAYS.between(LocalDate.now(), nextServiceDate);
    }

    @Transient
    public boolean isOverdue() {
        return nextServiceDate != null && nextServiceDate.isBefore(LocalDate.now());
    }
}
