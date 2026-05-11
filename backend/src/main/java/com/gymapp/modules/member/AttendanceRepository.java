package com.gymapp.modules.member;

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
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    Page<Attendance> findAllByGymIdAndMemberIdOrderByCheckInTimeDesc(UUID gymId, UUID memberId, Pageable pageable);

    List<Attendance> findTop10ByGymIdAndMemberIdOrderByCheckInTimeDesc(UUID gymId, UUID memberId);

    Optional<Attendance> findByGymIdAndMemberIdAndCheckOutTimeIsNull(UUID gymId, UUID memberId);

    long countByGymIdAndCheckInTimeBetween(UUID gymId, LocalDateTime from, LocalDateTime to);

    @Query("""
        SELECT FUNCTION('HOUR', a.checkInTime) AS hour, COUNT(a) AS cnt
        FROM Attendance a
        WHERE a.gymId = :gymId
          AND a.checkInTime >= :dayStart
          AND a.checkInTime < :dayEnd
        GROUP BY FUNCTION('HOUR', a.checkInTime)
        ORDER BY FUNCTION('HOUR', a.checkInTime)
        """)
    List<Object[]> findHourlyAttendance(UUID gymId, LocalDateTime dayStart, LocalDateTime dayEnd);

    @Query("""
        SELECT COUNT(DISTINCT a.memberId)
        FROM Attendance a
        WHERE a.gymId = :gymId
          AND a.checkInTime >= :dayStart
          AND a.checkInTime < :dayEnd
        """)
    long countDistinctMembersByGymIdAndCheckInTimeBetween(UUID gymId, LocalDateTime dayStart, LocalDateTime dayEnd);
}
