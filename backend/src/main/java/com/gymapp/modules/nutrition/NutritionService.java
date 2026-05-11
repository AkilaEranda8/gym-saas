package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.modules.nutrition.enums.NutritionGoal;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NutritionService {

    private final NutritionPlanRepository planRepository;
    private final MealTemplateRepository mealRepository;
    private final FoodItemRepository foodItemRepository;
    private final MemberNutritionAssignmentRepository assignmentRepository;
    private final NutritionMapper mapper;
    private final CurrentUser currentUser;

    public PageResponse<NutritionPlanDTO> listPlans(NutritionGoal goal, Boolean isTemplate,
                                                     String search, int page, int size) {
        UUID gymId = TenantContext.getGymId();
        var pg = planRepository.findAllByGymIdWithFilters(gymId, goal, isTemplate, search,
            PageRequest.of(page, size));
        return PageResponse.from(pg.map(p -> {
            long assignedCount = assignmentRepository.countByGymIdAndStatus(gymId,
                com.gymapp.modules.nutrition.enums.NutritionAssignmentStatus.ACTIVE);
            return mapper.toPlanDTO(p, p.getMeals().size(), 0L);
        }));
    }

    public List<NutritionPlanDTO> listTemplates() {
        UUID gymId = TenantContext.getGymId();
        return planRepository.findAllTemplates(gymId).stream()
            .map(p -> mapper.toPlanDTO(p, p.getMeals().size(), 0L)).toList();
    }

    public NutritionPlanDetailDTO getPlan(UUID id) {
        UUID gymId = TenantContext.getGymId();
        NutritionPlan plan = planRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Nutrition plan not found"));
        return mapper.toPlanDetailDTO(plan);
    }

    @Transactional
    public NutritionPlanDetailDTO createPlan(CreateNutritionPlanRequest req) {
        UUID gymId = TenantContext.getGymId();
        NutritionPlan plan = new NutritionPlan();
        plan.setGymId(gymId);
        plan.setCreatedBy(currentUser.getEmail());
        applyPlanFields(plan, req);
        plan.setTemplate(req.isTemplate());
        planRepository.save(plan);
        if (req.meals() != null) {
            saveMeals(plan, req.meals(), gymId);
        }
        return mapper.toPlanDetailDTO(planRepository.findByIdAndGymId(plan.getId(), gymId).orElseThrow());
    }

    @Transactional
    public NutritionPlanDetailDTO updatePlan(UUID id, UpdateNutritionPlanRequest req) {
        UUID gymId = TenantContext.getGymId();
        NutritionPlan plan = planRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Nutrition plan not found"));
        if (req.name()           != null) plan.setName(req.name());
        if (req.description()    != null) plan.setDescription(req.description());
        if (req.goal()           != null) plan.setGoal(req.goal());
        if (req.caloriesPerDay() != null) plan.setCaloriesPerDay(req.caloriesPerDay());
        if (req.proteinG()       != null) plan.setProteinG(req.proteinG());
        if (req.carbsG()         != null) plan.setCarbsG(req.carbsG());
        if (req.fatG()           != null) plan.setFatG(req.fatG());
        if (req.fiberG()         != null) plan.setFiberG(req.fiberG());
        if (req.waterMl()        != null) plan.setWaterMl(req.waterMl());
        if (req.mealsPerDay()    != null) plan.setMealsPerDay(req.mealsPerDay());
        if (req.durationWeeks()  != null) plan.setDurationWeeks(req.durationWeeks());
        if (req.isTemplate()     != null) plan.setTemplate(req.isTemplate());
        if (req.tags()           != null) plan.setTags(req.tags().toArray(new String[0]));
        if (req.allergens()      != null) plan.setAllergens(req.allergens().toArray(new String[0]));
        if (req.notes()          != null) plan.setNotes(req.notes());
        planRepository.save(plan);
        return mapper.toPlanDetailDTO(planRepository.findByIdAndGymId(id, gymId).orElseThrow());
    }

    @Transactional
    public void deletePlan(UUID id) {
        NutritionPlan plan = planRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Nutrition plan not found"));
        plan.setDeletedAt(LocalDateTime.now());
        plan.setActive(false);
        planRepository.save(plan);
    }

    public NutritionStatsDTO getStats() {
        UUID gymId = TenantContext.getGymId();
        long total     = planRepository.countByGymIdAndDeletedAtIsNull(gymId);
        long templates = planRepository.countTemplates(gymId);
        long active    = assignmentRepository.countByGymIdAndStatus(gymId,
            com.gymapp.modules.nutrition.enums.NutritionAssignmentStatus.ACTIVE);
        return new NutritionStatsDTO(total, templates, active, 0L, null, null, null);
    }

    private void applyPlanFields(NutritionPlan plan, CreateNutritionPlanRequest req) {
        plan.setName(req.name());
        plan.setDescription(req.description());
        plan.setGoal(req.goal());
        plan.setCaloriesPerDay(req.caloriesPerDay());
        plan.setProteinG(req.proteinG());
        plan.setCarbsG(req.carbsG());
        plan.setFatG(req.fatG());
        plan.setFiberG(req.fiberG());
        plan.setWaterMl(req.waterMl() != null ? req.waterMl() : 2000);
        plan.setMealsPerDay(req.mealsPerDay());
        plan.setDurationWeeks(req.durationWeeks() != null ? req.durationWeeks() : 4);
        plan.setNotes(req.notes());
        if (req.tags()      != null) plan.setTags(req.tags().toArray(new String[0]));
        if (req.allergens() != null) plan.setAllergens(req.allergens().toArray(new String[0]));
    }

    private void saveMeals(NutritionPlan plan, List<CreateMealRequest> mealReqs, UUID gymId) {
        for (CreateMealRequest mr : mealReqs) {
            MealTemplate meal = new MealTemplate();
            meal.setGymId(gymId);
            meal.setPlanId(plan.getId());
            meal.setMealNumber(mr.mealNumber());
            meal.setName(mr.name());
            meal.setTimeOfDay(mr.timeOfDay());
            meal.setDescription(mr.description());
            meal.setPreparationNotes(mr.preparationNotes());
            mealRepository.save(meal);
            if (mr.foodItems() != null) {
                int orderIdx = 0;
                for (AddFoodToMealRequest fir : mr.foodItems()) {
                    FoodItem food = foodItemRepository.findByIdAndGymId(UUID.fromString(fir.foodItemId()), gymId)
                        .orElseThrow(() -> new NoSuchElementException("Food item not found: " + fir.foodItemId()));
                    MealFoodItem mfi = new MealFoodItem();
                    mfi.setGymId(gymId);
                    mfi.setMealId(meal.getId());
                    mfi.setFoodItemId(food.getId());
                    mfi.setQuantityG(fir.quantityG());
                    mfi.setOrderIndex(orderIdx++);
                    mfi.setNotes(fir.notes());
                    meal.getFoodItems().add(mfi);
                }
                mealRepository.save(meal);
            }
        }
    }
}
