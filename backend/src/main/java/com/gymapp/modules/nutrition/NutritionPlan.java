package com.gymapp.modules.nutrition;

import com.gymapp.multitenancy.TenantEntity;
import com.gymapp.modules.nutrition.enums.NutritionGoal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "nutrition_plans")
@SQLRestriction("deleted_at IS NULL")
public class NutritionPlan extends TenantEntity {

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NutritionGoal goal;

    @Column(name = "calories_per_day", nullable = false)
    private Integer caloriesPerDay;

    @Column(name = "protein_g", nullable = false)
    private Integer proteinG;

    @Column(name = "carbs_g", nullable = false)
    private Integer carbsG;

    @Column(name = "fat_g", nullable = false)
    private Integer fatG;

    @Column(name = "fiber_g")
    private Integer fiberG;

    @Column(name = "water_ml")
    private Integer waterMl = 2000;

    @Column(name = "meals_per_day", nullable = false)
    private Integer mealsPerDay = 3;

    @Column(name = "duration_weeks")
    private Integer durationWeeks = 4;

    @Column(name = "is_template")
    private boolean template = false;

    @Column(name = "is_active")
    private boolean active = true;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allergens", columnDefinition = "text[]")
    private String[] allergens;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("mealNumber ASC")
    private List<MealTemplate> meals = new ArrayList<>();
}
