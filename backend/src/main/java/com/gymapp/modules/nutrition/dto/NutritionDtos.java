package com.gymapp.modules.nutrition.dto;

import com.gymapp.modules.nutrition.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class NutritionDtos {

    // ── Request DTOs ──────────────────────────────────────────────

    public record CreateNutritionPlanRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        @NotNull NutritionGoal goal,
        @NotNull @Min(500) @Max(10000) Integer caloriesPerDay,
        @NotNull @Min(0) Integer proteinG,
        @NotNull @Min(0) Integer carbsG,
        @NotNull @Min(0) Integer fatG,
        Integer fiberG,
        Integer waterMl,
        @NotNull @Min(1) @Max(8) Integer mealsPerDay,
        Integer durationWeeks,
        boolean isTemplate,
        List<String> tags,
        List<String> allergens,
        String notes,
        @Valid List<CreateMealRequest> meals
    ) {}

    public record UpdateNutritionPlanRequest(
        String name,
        String description,
        NutritionGoal goal,
        @Min(500) @Max(10000) Integer caloriesPerDay,
        @Min(0) Integer proteinG,
        @Min(0) Integer carbsG,
        @Min(0) Integer fatG,
        Integer fiberG,
        Integer waterMl,
        @Min(1) @Max(8) Integer mealsPerDay,
        Integer durationWeeks,
        Boolean isTemplate,
        List<String> tags,
        List<String> allergens,
        String notes
    ) {}

    public record CreateMealRequest(
        @NotNull @Min(1) @Max(8) Integer mealNumber,
        @NotBlank String name,
        @NotNull MealTimeOfDay timeOfDay,
        String description,
        String preparationNotes,
        @Valid List<AddFoodToMealRequest> foodItems
    ) {}

    public record AddFoodToMealRequest(
        @NotNull String foodItemId,
        @NotNull @DecimalMin("1.0") BigDecimal quantityG,
        String notes
    ) {}

    public record CreateFoodItemRequest(
        @NotBlank @Size(max = 100) String name,
        String brand,
        @NotNull FoodCategory category,
        @NotNull @DecimalMin("1.0") BigDecimal servingSizeG,
        String servingUnit,
        @NotNull @DecimalMin("0") BigDecimal caloriesPer100g,
        @NotNull @DecimalMin("0") BigDecimal proteinPer100g,
        @NotNull @DecimalMin("0") BigDecimal carbsPer100g,
        @NotNull @DecimalMin("0") BigDecimal fatPer100g,
        BigDecimal fiberPer100g,
        BigDecimal sugarPer100g,
        BigDecimal sodiumPer100g
    ) {}

    public record AssignNutritionPlanRequest(
        @NotNull String memberId,
        @NotNull String planId,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        Integer targetCalories,
        Integer targetProteinG,
        Integer targetCarbsG,
        Integer targetFatG,
        String notes
    ) {}

    public record LogNutritionRequest(
        LocalDate logDate,
        Integer waterMl,
        @Min(1) @Max(5) Integer overallFeeling,
        @Min(1) @Max(5) Integer energyLevel,
        String notes,
        @Valid List<LogMealRequest> meals
    ) {}

    public record LogMealRequest(
        @NotBlank String mealName,
        String timeOfDay,
        LocalDateTime loggedAt,
        String notes,
        @Valid List<LogFoodItemRequest> foodItems
    ) {}

    public record LogFoodItemRequest(
        String foodItemId,
        @NotBlank String foodName,
        @NotNull @DecimalMin("1.0") BigDecimal quantityG
    ) {}

    public record LogWaterRequest(
        @NotNull @Min(50) @Max(5000) Integer amountMl,
        LocalDate logDate
    ) {}

    public record AddSupplementRequest(
        @NotBlank String supplementName,
        String dosage,
        @NotNull SupplementTiming timing,
        String notes
    ) {}

    // ── Response DTOs ─────────────────────────────────────────────

    public record NutritionPlanDTO(
        UUID id,
        UUID gymId,
        String createdBy,
        String name,
        String description,
        NutritionGoal goal,
        Integer caloriesPerDay,
        Integer proteinG,
        Integer carbsG,
        Integer fatG,
        Integer fiberG,
        Integer waterMl,
        Integer mealsPerDay,
        Integer durationWeeks,
        boolean isTemplate,
        boolean isActive,
        String[] tags,
        String[] allergens,
        int mealCount,
        long assignedMembersCount,
        MacroBreakdownDTO macroSplit,
        LocalDateTime createdAt
    ) {}

    public record NutritionPlanDetailDTO(
        UUID id,
        UUID gymId,
        String createdBy,
        String name,
        String description,
        NutritionGoal goal,
        Integer caloriesPerDay,
        Integer proteinG,
        Integer carbsG,
        Integer fatG,
        Integer fiberG,
        Integer waterMl,
        Integer mealsPerDay,
        Integer durationWeeks,
        boolean isTemplate,
        boolean isActive,
        String[] tags,
        String[] allergens,
        String notes,
        List<MealTemplateDTO> meals,
        LocalDateTime createdAt
    ) {}

    public record MealTemplateDTO(
        UUID id,
        UUID planId,
        Integer mealNumber,
        String name,
        MealTimeOfDay timeOfDay,
        String timeOfDayDisplay,
        Integer calories,
        BigDecimal proteinG,
        BigDecimal carbsG,
        BigDecimal fatG,
        String description,
        String preparationNotes,
        List<MealFoodItemDTO> foodItems
    ) {}

    public record MealFoodItemDTO(
        UUID id,
        UUID mealId,
        UUID foodItemId,
        String foodName,
        String foodBrand,
        FoodCategory foodCategory,
        String foodCategoryColor,
        BigDecimal quantityG,
        String servingDisplay,
        BigDecimal calories,
        BigDecimal proteinG,
        BigDecimal carbsG,
        BigDecimal fatG,
        Integer orderIndex,
        String notes
    ) {}

    public record FoodItemDTO(
        UUID id,
        UUID gymId,
        String name,
        String brand,
        FoodCategory category,
        String categoryColor,
        BigDecimal servingSizeG,
        String servingUnit,
        BigDecimal caloriesPer100g,
        BigDecimal proteinPer100g,
        BigDecimal carbsPer100g,
        BigDecimal fatPer100g,
        BigDecimal fiberPer100g,
        BigDecimal sugarPer100g,
        boolean isCustom,
        boolean isVerified,
        BigDecimal caloriesPerServing,
        BigDecimal proteinPerServing,
        BigDecimal carbsPerServing,
        BigDecimal fatPerServing
    ) {}

    public record NutritionAssignmentDTO(
        UUID id,
        UUID gymId,
        UUID memberId,
        UUID planId,
        String memberName,
        String memberPhone,
        String planName,
        NutritionGoal planGoal,
        String assignedBy,
        LocalDate startDate,
        LocalDate endDate,
        NutritionAssignmentStatus status,
        Integer targetCalories,
        Integer targetProteinG,
        Integer targetCarbsG,
        Integer targetFatG,
        Double adherencePercent,
        Double avgCalories,
        String notes,
        LocalDateTime createdAt
    ) {}

    public record NutritionLogDTO(
        UUID id,
        UUID memberId,
        LocalDate logDate,
        Integer totalCalories,
        BigDecimal totalProteinG,
        BigDecimal totalCarbsG,
        BigDecimal totalFatG,
        BigDecimal totalFiberG,
        Integer waterMl,
        Integer overallFeeling,
        Integer energyLevel,
        int mealCount,
        Integer targetCalories,
        Integer calorieDeficit,
        LocalDateTime createdAt
    ) {}

    public record NutritionLogDetailDTO(
        UUID id,
        UUID memberId,
        LocalDate logDate,
        Integer totalCalories,
        BigDecimal totalProteinG,
        BigDecimal totalCarbsG,
        BigDecimal totalFatG,
        BigDecimal totalFiberG,
        Integer waterMl,
        Integer overallFeeling,
        Integer energyLevel,
        String notes,
        int mealCount,
        Integer targetCalories,
        Integer calorieDeficit,
        List<LogMealDTO> meals,
        List<SupplementScheduleDTO> supplements,
        LocalDateTime createdAt
    ) {}

    public record LogMealDTO(
        UUID id,
        UUID nutritionLogId,
        String mealName,
        String timeOfDay,
        LocalDateTime loggedAt,
        Integer calories,
        BigDecimal proteinG,
        BigDecimal carbsG,
        BigDecimal fatG,
        String notes,
        List<LogFoodItemDTO> foodItems
    ) {}

    public record LogFoodItemDTO(
        UUID id,
        UUID logMealId,
        UUID foodItemId,
        String foodName,
        BigDecimal quantityG,
        BigDecimal calories,
        BigDecimal proteinG,
        BigDecimal carbsG,
        BigDecimal fatG
    ) {}

    public record WaterLogDTO(
        UUID id,
        UUID memberId,
        LocalDate logDate,
        Integer amountMl,
        LocalDateTime loggedAt
    ) {}

    public record DailyWaterSummaryDTO(
        LocalDate logDate,
        Integer totalMl,
        Integer targetMl,
        double percentage,
        List<WaterLogDTO> logs
    ) {}

    public record SupplementScheduleDTO(
        UUID id,
        UUID memberId,
        String supplementName,
        String dosage,
        SupplementTiming timing,
        String timingDisplay,
        String notes,
        boolean isActive
    ) {}

    public record MemberNutritionSummaryDTO(
        NutritionPlanDTO currentPlan,
        NutritionAssignmentDTO currentAssignment,
        NutritionLogDTO todayLog,
        Integer todayCalories,
        Integer todayCaloriesTarget,
        BigDecimal todayProteinG,
        Integer todayProteinTarget,
        BigDecimal todayCarbsG,
        Integer todayCarbsTarget,
        BigDecimal todayFatG,
        Integer todayFatTarget,
        Integer todayWaterMl,
        Integer todayWaterTarget,
        Double weeklyAdherence,
        int logsThisWeek,
        int logsThisMonth,
        Double avgCaloriesThisWeek,
        List<SupplementScheduleDTO> supplements,
        int streakDays
    ) {}

    public record NutritionStatsDTO(
        long totalPlans,
        long templatePlans,
        long activeAssignments,
        long logsThisMonth,
        String mostUsedPlan,
        String mostPopularGoal,
        Double avgAdherence
    ) {}

    public record MacroBreakdownDTO(
        Integer proteinG,
        double proteinPercent,
        Integer carbsG,
        double carbsPercent,
        Integer fatG,
        double fatPercent,
        Integer totalCalories
    ) {}

    public record NutritionProgressDTO(
        UUID memberId,
        List<DailyCalorieDTO> weeklyCalories,
        Double avgCalories,
        Double avgProtein,
        Double avgCarbs,
        Double avgFat,
        Double avgWater
    ) {}

    public record DailyCalorieDTO(
        LocalDate date,
        Integer calories,
        Integer target,
        Integer deficit
    ) {}
}
