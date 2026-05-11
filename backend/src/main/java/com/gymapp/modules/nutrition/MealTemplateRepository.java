package com.gymapp.modules.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MealTemplateRepository extends JpaRepository<MealTemplate, UUID> {

    List<MealTemplate> findAllByPlanIdOrderByMealNumberAsc(UUID planId);

    Optional<MealTemplate> findByPlanIdAndMealNumber(UUID planId, Integer mealNumber);

    void deleteAllByPlanId(UUID planId);

    @Query("SELECT COALESCE(MAX(m.mealNumber), 0) FROM MealTemplate m WHERE m.planId = :planId")
    Integer findMaxMealNumberByPlanId(@Param("planId") UUID planId);
}
