package com.gymapp.modules.workout;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, UUID> {

    Page<WorkoutLog> findAllByGymIdAndMemberIdOrderByLogDateDesc(UUID gymId, UUID memberId, Pageable pageable);

    Page<WorkoutLog> findAllByGymIdOrderByLogDateDesc(UUID gymId, Pageable pageable);

    Optional<WorkoutLog> findByIdAndGymId(UUID id, UUID gymId);

    List<WorkoutLog> findAllByGymIdAndMemberIdAndLogDateBetweenOrderByLogDateDesc(
        UUID gymId, UUID memberId, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(l) FROM WorkoutLog l WHERE l.gymId = :gymId AND l.memberId = :memberId AND l.logDate >= :from")
    long countSessionsSince(@Param("gymId") UUID gymId, @Param("memberId") UUID memberId, @Param("from") LocalDate from);

    @Query("SELECT COALESCE(SUM(l.durationMinutes), 0) FROM WorkoutLog l WHERE l.gymId = :gymId AND l.memberId = :memberId AND l.logDate >= :from")
    long totalMinutesSince(@Param("gymId") UUID gymId, @Param("memberId") UUID memberId, @Param("from") LocalDate from);
}
