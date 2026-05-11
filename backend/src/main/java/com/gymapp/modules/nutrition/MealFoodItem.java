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
@Table(name = "meal_food_items")
public class MealFoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "meal_id", nullable = false)
    private UUID mealId;

    @Column(name = "food_item_id", nullable = false)
    private UUID foodItemId;

    @Column(name = "quantity_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantityG;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(length = 100)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", insertable = false, updatable = false)
    private MealTemplate meal;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "food_item_id", insertable = false, updatable = false)
    private FoodItem foodItem;
}
