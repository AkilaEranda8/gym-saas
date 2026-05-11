package com.gymapp.modules.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, UUID> {

    List<WorkoutExercise> findAllByDayIdOrderByOrderIndexAsc(UUID dayId);
    void deleteAllByDayId(UUID dayId);
}
