package com.gymapp.modules.trainer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerSessionRepository extends JpaRepository<TrainerSession, UUID> {

    @Query("SELECT s FROM TrainerSession s WHERE s.gymId = :gymId "
         + "AND (:trainerId IS NULL OR s.trainerId = :trainerId) "
         + "AND (:status IS NULL OR s.status = :status) "
         + "AND (:from IS NULL OR s.sessionDate >= :from) "
         + "AND (:to IS NULL OR s.sessionDate <= :to)")
    Page<TrainerSession> findAllWithFilters(
            @Param("gymId") UUID gymId,
            @Param("trainerId") UUID trainerId,
            @Param("status") PTSessionStatus status,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable);

    List<TrainerSession> findAllByTrainerIdAndSessionDateBetween(UUID trainerId, LocalDate from, LocalDate to);

    Page<TrainerSession> findAllByMemberIdAndStatus(UUID memberId, PTSessionStatus status, Pageable pageable);

    Page<TrainerSession> findAllByMemberId(UUID memberId, Pageable pageable);

    long countByTrainerIdAndStatus(UUID trainerId, PTSessionStatus status);

    List<TrainerSession> findByTrainerIdAndSessionDate(UUID trainerId, LocalDate date);

    long countByTrainerIdAndSessionDateBetween(UUID trainerId, LocalDate from, LocalDate to);

    boolean existsByTrainerIdAndSessionDateAndStartTimeLessThanAndEndTimeGreaterThan(
            UUID trainerId, LocalDate date,
            java.time.LocalTime endTime, java.time.LocalTime startTime);
}
