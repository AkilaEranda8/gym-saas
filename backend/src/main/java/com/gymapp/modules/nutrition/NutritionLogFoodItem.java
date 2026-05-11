package com.gymapp.modules.nutrition;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "nutrition_log_food_items")
public class NutritionLogFoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "log_meal_id", nullable = false)
    private UUID logMealId;

    @Column(name = "food_item_id")
    private UUID foodItemId;

    @Column(name = "food_name", nullable = false, length = 100)
    private String foodName;

    @Column(name = "quantity_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantityG;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal calories;

    @Column(name = "protein_g", precision = 6, scale = 2)
    private BigDecimal proteinG = BigDecimal.ZERO;

    @Column(name = "carbs_g", precision = 6, scale = 2)
    private BigDecimal carbsG = BigDecimal.ZERO;

    @Column(name = "fat_g", precision = 6, scale = 2)
    private BigDecimal fatG = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_meal_id", insertable = false, updatable = false)
    private NutritionLogMeal logMeal;
}
