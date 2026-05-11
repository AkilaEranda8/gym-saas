package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.enums.FoodCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "food_items")
@SQLRestriction("deleted_at IS NULL")
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id")
    private UUID gymId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String brand;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FoodCategory category;

    @Column(name = "serving_size_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal servingSizeG = BigDecimal.valueOf(100);

    @Column(name = "serving_unit", length = 20)
    private String servingUnit = "g";

    @Column(name = "calories_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal caloriesPer100g;

    @Column(name = "protein_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal proteinPer100g = BigDecimal.ZERO;

    @Column(name = "carbs_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal carbsPer100g = BigDecimal.ZERO;

    @Column(name = "fat_per_100g", nullable = false, precision = 8, scale = 2)
    private BigDecimal fatPer100g = BigDecimal.ZERO;

    @Column(name = "fiber_per_100g", precision = 8, scale = 2)
    private BigDecimal fiberPer100g = BigDecimal.ZERO;

    @Column(name = "sugar_per_100g", precision = 8, scale = 2)
    private BigDecimal sugarPer100g = BigDecimal.ZERO;

    @Column(name = "sodium_per_100g", precision = 8, scale = 2)
    private BigDecimal sodiumPer100g = BigDecimal.ZERO;

    @Column(name = "is_custom")
    private boolean custom = false;

    @Column(name = "is_verified")
    private boolean verified = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Transient
    public BigDecimal getCaloriesForQuantity(BigDecimal quantityG) {
        return caloriesPer100g.multiply(quantityG).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    @Transient
    public BigDecimal getProteinForQuantity(BigDecimal quantityG) {
        return proteinPer100g.multiply(quantityG).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    @Transient
    public BigDecimal getCarbsForQuantity(BigDecimal quantityG) {
        return carbsPer100g.multiply(quantityG).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    @Transient
    public BigDecimal getFatForQuantity(BigDecimal quantityG) {
        return fatPer100g.multiply(quantityG).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }
}
