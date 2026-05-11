package com.gymapp.modules.trainer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainerAvailabilityRepository extends JpaRepository<TrainerAvailability, UUID> {

    List<TrainerAvailability> findAllByTrainerId(UUID trainerId);

    Optional<TrainerAvailability> findByTrainerIdAndDayOfWeek(UUID trainerId, Integer dayOfWeek);

    void deleteAllByTrainerId(UUID trainerId);

    @Query("SELECT a FROM TrainerAvailability a WHERE a.gymId = :gymId "
         + "AND a.dayOfWeek = :day "
         + "AND a.isAvailable = true "
         + "AND a.startTime <= :time AND a.endTime >= :time")
    List<TrainerAvailability> findAvailableTrainersForSlot(
            @Param("gymId") UUID gymId,
            @Param("day") Integer day,
            @Param("time") LocalTime time);
}
