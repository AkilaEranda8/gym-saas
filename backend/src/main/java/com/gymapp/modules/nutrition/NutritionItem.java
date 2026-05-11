// REPLACED — see MealTemplate.java
package com.gymapp.modules.nutrition;

import com.gymapp.multitenancy.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NutritionItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutrition_plan_id", nullable = false)
    @JsonIgnore
    private NutritionPlan nutritionPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 30)
    private String quantity;

    @Column(length = 20)
    private String unit;

    private Integer calories;

    @Column(name = "protein_grams")
    private Double proteinGrams;

    @Column(name = "carbs_grams")
    private Double carbsGrams;

    @Column(name = "fat_grams")
    private Double fatGrams;

    public enum MealType {
        BREAKFAST, MORNING_SNACK, LUNCH, AFTERNOON_SNACK, DINNER, PRE_WORKOUT, POST_WORKOUT
    }
}
