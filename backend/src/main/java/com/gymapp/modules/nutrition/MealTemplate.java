package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.enums.MealTimeOfDay;
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
@Table(name = "meal_templates",
    uniqueConstraints = @UniqueConstraint(columnNames = {"plan_id", "meal_number"}))
public class MealTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "meal_number", nullable = false)
    private Integer mealNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_of_day", nullable = false, length = 20)
    private MealTimeOfDay timeOfDay;

    @Column
    private Integer calories;

    @Column(name = "protein_g", precision = 6, scale = 2)
    private BigDecimal proteinG;

    @Column(name = "carbs_g", precision = 6, scale = 2)
    private BigDecimal carbsG;

    @Column(name = "fat_g", precision = 6, scale = 2)
    private BigDecimal fatG;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "preparation_notes", columnDefinition = "text")
    private String preparationNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", insertable = false, updatable = false)
    private NutritionPlan plan;

    @OneToMany(mappedBy = "meal", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<MealFoodItem> foodItems = new ArrayList<>();
}
