package com.gymapp.modules.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, UUID> {

    List<WorkoutDay> findAllByPlanIdOrderByDayNumberAsc(UUID planId);
    Optional<WorkoutDay> findByIdAndGymId(UUID id, UUID gymId);
    void deleteAllByPlanId(UUID planId);
}
