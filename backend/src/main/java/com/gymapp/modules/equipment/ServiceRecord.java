package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.enums.ServiceType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "service_records")
public class ServiceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "equipment_id", nullable = false)
    private UUID equipmentId;

    @Column(name = "schedule_id")
    private UUID scheduleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false, length = 30)
    private ServiceType serviceType;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(name = "service_provider", length = 100)
    private String serviceProvider;

    @Column(name = "cost_lkr")
    private Long costLkr;

    @Column(name = "duration_hours", precision = 4, scale = 1)
    private BigDecimal durationHours;

    @Column(name = "condition_before", length = 20)
    private String conditionBefore;

    @Column(name = "condition_after", length = 20)
    private String conditionAfter;

    @Column(name = "parts_replaced", columnDefinition = "text")
    private String partsReplaced;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;

    @Column(name = "invoice_url", length = 255)
    private String invoiceUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
