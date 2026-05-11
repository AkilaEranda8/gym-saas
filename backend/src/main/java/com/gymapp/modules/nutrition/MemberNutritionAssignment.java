package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.enums.NutritionAssignmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "member_nutrition_assignments")
public class MemberNutritionAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "assigned_by", length = 100)
    private String assignedBy;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NutritionAssignmentStatus status = NutritionAssignmentStatus.ACTIVE;

    @Column(name = "target_calories")
    private Integer targetCalories;

    @Column(name = "target_protein_g")
    private Integer targetProteinG;

    @Column(name = "target_carbs_g")
    private Integer targetCarbsG;

    @Column(name = "target_fat_g")
    private Integer targetFatG;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", insertable = false, updatable = false)
    private NutritionPlan plan;
}
