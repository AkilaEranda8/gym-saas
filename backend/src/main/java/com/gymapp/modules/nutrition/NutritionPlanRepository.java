package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.enums.NutritionGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, UUID> {

    @Query("""
        SELECT p FROM NutritionPlan p
        WHERE p.gymId = :gymId
          AND (:goal IS NULL OR p.goal = :goal)
          AND (:isTemplate IS NULL OR p.template = :isTemplate)
          AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY p.createdAt DESC
        """)
    Page<NutritionPlan> findAllByGymIdWithFilters(
        @Param("gymId") UUID gymId,
        @Param("goal") NutritionGoal goal,
        @Param("isTemplate") Boolean isTemplate,
        @Param("search") String search,
        Pageable pageable);

    Optional<NutritionPlan> findByIdAndGymId(UUID id, UUID gymId);

    @Query("SELECT p FROM NutritionPlan p WHERE (p.gymId = :gymId OR p.gymId IS NULL) AND p.template = true")
    List<NutritionPlan> findAllTemplates(@Param("gymId") UUID gymId);

    List<NutritionPlan> findAllByGymIdAndActiveTrue(UUID gymId);

    long countByGymIdAndDeletedAtIsNull(UUID gymId);

    @Query("SELECT COUNT(p) FROM NutritionPlan p WHERE (p.gymId = :gymId OR p.gymId IS NULL) AND p.template = true")
    long countTemplates(@Param("gymId") UUID gymId);
}
