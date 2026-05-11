package com.gymapp.modules.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyWorkoutRepository extends JpaRepository<DailyWorkout, UUID> {
    Optional<DailyWorkout> findByGymIdAndWorkoutDate(UUID gymId, LocalDate date);
    List<DailyWorkout> findAllByGymIdAndWorkoutDateBetweenOrderByWorkoutDateAsc(
        UUID gymId, LocalDate from, LocalDate to);
    Optional<DailyWorkout> findByIdAndGymId(UUID id, UUID gymId);
}
