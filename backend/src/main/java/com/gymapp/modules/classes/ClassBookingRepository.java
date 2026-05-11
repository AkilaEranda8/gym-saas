package com.gymapp.modules.classes;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassBookingRepository extends JpaRepository<ClassBooking, UUID> {

    Optional<ClassBooking> findBySessionIdAndMemberId(UUID sessionId, UUID memberId);

    Optional<ClassBooking> findByIdAndGymId(UUID id, UUID gymId);

    List<ClassBooking> findAllBySessionId(UUID sessionId);

    List<ClassBooking> findAllBySessionIdAndStatus(UUID sessionId, BookingStatus status);

    Page<ClassBooking> findAllByMemberIdAndStatusIn(UUID memberId, List<BookingStatus> statuses, Pageable pageable);

    long countBySessionIdAndStatusIn(UUID sessionId, List<BookingStatus> statuses);

    boolean existsBySessionIdAndMemberIdAndStatusNot(UUID sessionId, UUID memberId, BookingStatus status);

    @Query("""
        SELECT b FROM ClassBooking b
        JOIN ClassSession s ON s.id = b.sessionId
        WHERE b.memberId = :memberId
          AND b.status IN ('BOOKED','WAITLISTED')
          AND s.sessionDate >= :fromDate
        ORDER BY s.sessionDate ASC, s.startTime ASC
        """)
    List<ClassBooking> findUpcomingByMemberId(UUID memberId, java.time.LocalDate fromDate);

    long countByGymIdAndBookedAtBetween(UUID gymId, LocalDateTime from, LocalDateTime to);

    @Query("""
        SELECT COUNT(b) FROM ClassBooking b
        JOIN ClassSession s ON s.id = b.sessionId
        WHERE b.gymId = :gymId
          AND s.sessionDate BETWEEN :from AND :to
          AND b.status = 'ATTENDED'
        """)
    long countAttendedInPeriod(UUID gymId, java.time.LocalDate from, java.time.LocalDate to);
}
