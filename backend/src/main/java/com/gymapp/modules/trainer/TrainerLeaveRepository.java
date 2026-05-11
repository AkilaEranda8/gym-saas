package com.gymapp.modules.trainer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerLeaveRepository extends JpaRepository<TrainerLeave, UUID> {

    List<TrainerLeave> findAllByTrainerIdOrderByFromDateDesc(UUID trainerId);

    List<TrainerLeave> findByGymIdAndStatus(UUID gymId, LeaveStatus status);

    @Query("SELECT l FROM TrainerLeave l WHERE l.trainerId = :trainerId "
         + "AND l.status = 'APPROVED' "
         + "AND l.fromDate <= :today AND l.toDate >= :today")
    List<TrainerLeave> findActiveLeaveByTrainerId(
            @Param("trainerId") UUID trainerId,
            @Param("today") LocalDate today);

    @Query("SELECT COUNT(l) > 0 FROM TrainerLeave l WHERE l.trainerId = :trainerId "
         + "AND l.status = 'PENDING' "
         + "AND NOT (l.toDate < :from OR l.fromDate > :to)")
    boolean existsConflictingLeave(
            @Param("trainerId") UUID trainerId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
