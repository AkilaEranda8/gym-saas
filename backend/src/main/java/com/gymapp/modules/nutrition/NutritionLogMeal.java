package com.gymapp.modules.nutrition;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "nutrition_log_meals")
public class NutritionLogMeal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "nutrition_log_id", nullable = false)
    private UUID nutritionLogId;

    @Column(name = "meal_name", nullable = false, length = 100)
    private String mealName;

    @Column(name = "time_of_day", length = 30)
    private String timeOfDay;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt = LocalDateTime.now();

    @Column
    private Integer calories = 0;

    @Column(name = "protein_g", precision = 6, scale = 2)
    private BigDecimal proteinG = BigDecimal.ZERO;

    @Column(name = "carbs_g", precision = 6, scale = 2)
    private BigDecimal carbsG = BigDecimal.ZERO;

    @Column(name = "fat_g", precision = 6, scale = 2)
    private BigDecimal fatG = BigDecimal.ZERO;

    @Column(columnDefinition = "text")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutrition_log_id", insertable = false, updatable = false)
    private NutritionLog nutritionLog;

    @OneToMany(mappedBy = "logMeal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NutritionLogFoodItem> foodItems = new ArrayList<>();
}
