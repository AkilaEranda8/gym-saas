package com.gymapp.modules.classes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, UUID> {

    List<ClassSession> findAllByGymIdAndSessionDate(UUID gymId, LocalDate date);

    List<ClassSession> findAllByGymIdAndSessionDateBetween(UUID gymId, LocalDate from, LocalDate to);

    Optional<ClassSession> findByIdAndGymId(UUID id, UUID gymId);

    List<ClassSession> findAllByClassIdAndSessionDateBetween(UUID classId, LocalDate from, LocalDate to);

    List<ClassSession> findAllByScheduleIdAndSessionDateGreaterThanEqual(UUID scheduleId, LocalDate date);

    boolean existsByScheduleIdAndSessionDate(UUID scheduleId, LocalDate date);

    boolean existsByClassIdAndSessionDate(UUID classId, LocalDate date);

    @Query("""
        SELECT COUNT(b) FROM ClassBooking b
        WHERE b.sessionId = :sessionId
          AND b.status IN ('BOOKED','ATTENDED')
        """)
    int countBookedBySessionId(UUID sessionId);

    @Query("""
        SELECT s FROM ClassSession s
        WHERE s.gymId = :gymId
          AND s.sessionDate = :date
          AND (:branchId IS NULL OR EXISTS (
                SELECT 1 FROM FitnessClass f
                WHERE f.id = s.classId AND f.branchId = :branchId))
        ORDER BY s.startTime
        """)
    List<ClassSession> findByGymDateBranch(UUID gymId, LocalDate date, UUID branchId);

    @Query("""
        SELECT s FROM ClassSession s
        WHERE s.gymId = :gymId
          AND s.sessionDate >= :from
          AND s.sessionDate <= :to
          AND (:branchId IS NULL OR EXISTS (
                SELECT 1 FROM FitnessClass f
                WHERE f.id = s.classId AND f.branchId = :branchId))
        ORDER BY s.sessionDate, s.startTime
        """)
    List<ClassSession> findByGymDateRangeBranch(UUID gymId, LocalDate from, LocalDate to, UUID branchId);

    long countByGymIdAndSessionDateBetween(UUID gymId, LocalDate from, LocalDate to);

    long countByGymIdAndSessionDateBetweenAndStatus(UUID gymId, LocalDate from, LocalDate to, SessionStatus status);
}
