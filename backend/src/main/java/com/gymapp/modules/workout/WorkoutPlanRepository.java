package com.gymapp.modules.workout;

import com.gymapp.modules.workout.enums.WorkoutGoal;
import com.gymapp.modules.workout.enums.WorkoutLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, UUID> {

    @Query("SELECT p FROM WorkoutPlan p WHERE (p.gymId = :gymId OR p.gymId IS NULL) AND p.deletedAt IS NULL AND p.template = true ORDER BY p.name")
    List<WorkoutPlan> findTemplates(@Param("gymId") UUID gymId);

    @Query("SELECT p FROM WorkoutPlan p WHERE p.gymId = :gymId AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    Page<WorkoutPlan> findAllByGymId(@Param("gymId") UUID gymId, Pageable pageable);

    @Query("SELECT p FROM WorkoutPlan p WHERE p.gymId = :gymId AND p.deletedAt IS NULL " +
           "AND (:goal IS NULL OR p.goal = :goal) AND (:level IS NULL OR p.level = :level) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<WorkoutPlan> findByFilters(@Param("gymId") UUID gymId,
                                    @Param("goal") WorkoutGoal goal,
                                    @Param("level") WorkoutLevel level,
                                    @Param("search") String search,
                                    Pageable pageable);

    Optional<WorkoutPlan> findByIdAndGymIdAndDeletedAtIsNull(UUID id, UUID gymId);

    long countByGymIdAndDeletedAtIsNull(UUID gymId);
}
