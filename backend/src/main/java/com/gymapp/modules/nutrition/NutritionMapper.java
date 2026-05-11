package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class NutritionMapper {

    public NutritionPlanDTO toPlanDTO(NutritionPlan p, int mealCount, long assignedCount) {
        return new NutritionPlanDTO(
            p.getId(), p.getGymId(), p.getCreatedBy(),
            p.getName(), p.getDescription(), p.getGoal(),
            p.getCaloriesPerDay(), p.getProteinG(), p.getCarbsG(), p.getFatG(), p.getFiberG(),
            p.getWaterMl(), p.getMealsPerDay(), p.getDurationWeeks(),
            p.isTemplate(), p.isActive(),
            p.getTags(), p.getAllergens(),
            mealCount, assignedCount,
            calculateMacroSplit(p.getCaloriesPerDay(), p.getProteinG(), p.getCarbsG(), p.getFatG()),
            p.getCreatedAt()
        );
    }

    public NutritionPlanDetailDTO toPlanDetailDTO(NutritionPlan p) {
        List<MealTemplateDTO> meals = p.getMeals() == null ? List.of()
            : p.getMeals().stream().map(this::toMealTemplateDTO).toList();
        return new NutritionPlanDetailDTO(
            p.getId(), p.getGymId(), p.getCreatedBy(),
            p.getName(), p.getDescription(), p.getGoal(),
            p.getCaloriesPerDay(), p.getProteinG(), p.getCarbsG(), p.getFatG(), p.getFiberG(),
            p.getWaterMl(), p.getMealsPerDay(), p.getDurationWeeks(),
            p.isTemplate(), p.isActive(),
            p.getTags(), p.getAllergens(), p.getNotes(),
            meals, p.getCreatedAt()
        );
    }

    public MealTemplateDTO toMealTemplateDTO(MealTemplate m) {
        List<MealFoodItemDTO> foods = m.getFoodItems() == null ? List.of()
            : m.getFoodItems().stream().map(this::toMealFoodItemDTO).toList();
        return new MealTemplateDTO(
            m.getId(), m.getPlanId(), m.getMealNumber(), m.getName(),
            m.getTimeOfDay(),
            m.getTimeOfDay() != null ? m.getTimeOfDay().getDisplayName() : null,
            m.getCalories(),
            m.getProteinG(), m.getCarbsG(), m.getFatG(),
            m.getDescription(), m.getPreparationNotes(), foods
        );
    }

    public MealFoodItemDTO toMealFoodItemDTO(MealFoodItem mfi) {
        FoodItem fi = mfi.getFoodItem();
        BigDecimal qty = mfi.getQuantityG();
        BigDecimal cal = fi != null ? fi.getCaloriesForQuantity(qty) : BigDecimal.ZERO;
        BigDecimal pro = fi != null ? fi.getProteinForQuantity(qty) : BigDecimal.ZERO;
        BigDecimal carb = fi != null ? fi.getCarbsForQuantity(qty) : BigDecimal.ZERO;
        BigDecimal fat = fi != null ? fi.getFatForQuantity(qty) : BigDecimal.ZERO;
        String servingDisplay = qty.stripTrailingZeros().toPlainString() + "g";
        return new MealFoodItemDTO(
            mfi.getId(), mfi.getMealId(), mfi.getFoodItemId(),
            fi != null ? fi.getName() : "Unknown",
            fi != null ? fi.getBrand() : null,
            fi != null ? fi.getCategory() : null,
            fi != null ? fi.getCategory().getColor() : null,
            qty, servingDisplay, cal, pro, carb, fat,
            mfi.getOrderIndex(), mfi.getNotes()
        );
    }

    public FoodItemDTO toFoodItemDTO(FoodItem f) {
        BigDecimal serving = f.getServingSizeG();
        return new FoodItemDTO(
            f.getId(), f.getGymId(), f.getName(), f.getBrand(),
            f.getCategory(), f.getCategory().getColor(),
            f.getServingSizeG(), f.getServingUnit(),
            f.getCaloriesPer100g(), f.getProteinPer100g(), f.getCarbsPer100g(), f.getFatPer100g(),
            f.getFiberPer100g(), f.getSugarPer100g(),
            f.isCustom(), f.isVerified(),
            f.getCaloriesForQuantity(serving),
            f.getProteinForQuantity(serving),
            f.getCarbsForQuantity(serving),
            f.getFatForQuantity(serving)
        );
    }

    public NutritionLogDTO toLogDTO(NutritionLog l, Integer targetCalories) {
        Integer deficit = (targetCalories != null && l.getTotalCalories() != null)
            ? targetCalories - l.getTotalCalories() : null;
        return new NutritionLogDTO(
            l.getId(), l.getMemberId(), l.getLogDate(),
            l.getTotalCalories(), l.getTotalProteinG(), l.getTotalCarbsG(),
            l.getTotalFatG(), l.getTotalFiberG(), l.getWaterMl(),
            l.getOverallFeeling(), l.getEnergyLevel(),
            l.getMeals() == null ? 0 : l.getMeals().size(),
            targetCalories, deficit, l.getCreatedAt()
        );
    }

    public NutritionLogDetailDTO toLogDetailDTO(NutritionLog l, Integer targetCalories,
                                                 List<SupplementScheduleDTO> supplements) {
        List<LogMealDTO> meals = l.getMeals() == null ? List.of()
            : l.getMeals().stream().map(this::toLogMealDTO).toList();
        Integer deficit = (targetCalories != null && l.getTotalCalories() != null)
            ? targetCalories - l.getTotalCalories() : null;
        return new NutritionLogDetailDTO(
            l.getId(), l.getMemberId(), l.getLogDate(),
            l.getTotalCalories(), l.getTotalProteinG(), l.getTotalCarbsG(),
            l.getTotalFatG(), l.getTotalFiberG(), l.getWaterMl(),
            l.getOverallFeeling(), l.getEnergyLevel(), l.getNotes(),
            meals.size(), targetCalories, deficit, meals, supplements,
            l.getCreatedAt()
        );
    }

    public LogMealDTO toLogMealDTO(NutritionLogMeal m) {
        List<LogFoodItemDTO> items = m.getFoodItems() == null ? List.of()
            : m.getFoodItems().stream().map(this::toLogFoodItemDTO).toList();
        return new LogMealDTO(
            m.getId(), m.getNutritionLogId(), m.getMealName(), m.getTimeOfDay(),
            m.getLoggedAt(), m.getCalories(), m.getProteinG(), m.getCarbsG(), m.getFatG(),
            m.getNotes(), items
        );
    }

    public LogFoodItemDTO toLogFoodItemDTO(NutritionLogFoodItem i) {
        return new LogFoodItemDTO(
            i.getId(), i.getLogMealId(), i.getFoodItemId(), i.getFoodName(),
            i.getQuantityG(), i.getCalories(), i.getProteinG(), i.getCarbsG(), i.getFatG()
        );
    }

    public WaterLogDTO toWaterLogDTO(WaterLog w) {
        return new WaterLogDTO(w.getId(), w.getMemberId(), w.getLogDate(), w.getAmountMl(), w.getLoggedAt());
    }

    public SupplementScheduleDTO toSupplementDTO(SupplementSchedule s) {
        return new SupplementScheduleDTO(
            s.getId(), s.getMemberId(), s.getSupplementName(), s.getDosage(),
            s.getTiming(),
            s.getTiming() != null ? s.getTiming().getDisplayName() : null,
            s.getNotes(), s.isActive()
        );
    }

    public MacroBreakdownDTO calculateMacroSplit(Integer calories, Integer proteinG, Integer carbsG, Integer fatG) {
        if (calories == null || calories == 0) {
            return new MacroBreakdownDTO(proteinG, 0, carbsG, 0, fatG, 0, 0);
        }
        double proteinCals = proteinG != null ? proteinG * 4.0 : 0;
        double carbsCals   = carbsG   != null ? carbsG   * 4.0 : 0;
        double fatCals     = fatG     != null ? fatG     * 9.0 : 0;
        return new MacroBreakdownDTO(
            proteinG, round(proteinCals / calories * 100),
            carbsG,   round(carbsCals   / calories * 100),
            fatG,     round(fatCals     / calories * 100),
            calories
        );
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
