package com.gymapp.modules.workout;

import com.gymapp.modules.workout.enums.ExerciseCategory;
import com.gymapp.modules.workout.enums.ExerciseEquipment;
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
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

    @Query("SELECT e FROM Exercise e WHERE (e.gymId IS NULL OR e.gymId = :gymId) AND e.deletedAt IS NULL " +
           "AND (:category IS NULL OR e.category = :category) " +
           "AND (:equipment IS NULL OR e.equipment = :equipment) " +
           "AND (:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.name")
    Page<Exercise> findByFilters(@Param("gymId") UUID gymId,
                                  @Param("category") ExerciseCategory category,
                                  @Param("equipment") ExerciseEquipment equipment,
                                  @Param("search") String search,
                                  Pageable pageable);

    @Query("SELECT e FROM Exercise e WHERE (e.gymId IS NULL OR e.gymId = :gymId) AND e.deletedAt IS NULL ORDER BY e.name")
    List<Exercise> findAllForGym(@Param("gymId") UUID gymId);

    Optional<Exercise> findByIdAndDeletedAtIsNull(UUID id);

    boolean existsByNameAndGymId(String name, UUID gymId);
}
