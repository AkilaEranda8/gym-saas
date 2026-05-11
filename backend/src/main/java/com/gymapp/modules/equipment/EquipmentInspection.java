package com.gymapp.modules.equipment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "equipment_inspections")
public class EquipmentInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "equipment_id", nullable = false)
    private UUID equipmentId;

    @Column(name = "inspected_by", nullable = false, length = 100)
    private String inspectedBy;

    @Column(name = "inspected_by_name", length = 100)
    private String inspectedByName;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Column(name = "overall_rating", nullable = false)
    private Integer overallRating;

    @Column(name = "is_operational", nullable = false)
    private Boolean isOperational;

    @Column(name = "issues_found", columnDefinition = "text")
    private String issuesFound;

    @Column(name = "actions_required", columnDefinition = "text")
    private String actionsRequired;

    @Column(name = "next_inspection_date")
    private LocalDate nextInspectionDate;

    @Column(name = "photos_urls", columnDefinition = "text")
    private String photosUrls;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
