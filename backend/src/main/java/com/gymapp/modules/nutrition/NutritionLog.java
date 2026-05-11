package com.gymapp.modules.nutrition;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "nutrition_logs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "log_date"}))
public class NutritionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "total_calories")
    private Integer totalCalories = 0;

    @Column(name = "total_protein_g", precision = 6, scale = 2)
    private BigDecimal totalProteinG = BigDecimal.ZERO;

    @Column(name = "total_carbs_g", precision = 6, scale = 2)
    private BigDecimal totalCarbsG = BigDecimal.ZERO;

    @Column(name = "total_fat_g", precision = 6, scale = 2)
    private BigDecimal totalFatG = BigDecimal.ZERO;

    @Column(name = "total_fiber_g", precision = 6, scale = 2)
    private BigDecimal totalFiberG = BigDecimal.ZERO;

    @Column(name = "water_ml")
    private Integer waterMl = 0;

    @Column(name = "overall_feeling")
    private Integer overallFeeling;

    @Column(name = "energy_level")
    private Integer energyLevel;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "nutritionLog", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("loggedAt ASC")
    private List<NutritionLogMeal> meals = new ArrayList<>();
}
