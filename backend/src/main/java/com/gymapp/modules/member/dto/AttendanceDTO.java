package com.gymapp.modules.member.dto;

import com.gymapp.modules.member.Attendance;
import com.gymapp.modules.member.CheckInMethod;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

public record AttendanceDTO(
    UUID id,
    UUID memberId,
    UUID branchId,
    LocalDateTime checkInTime,
    LocalDateTime checkOutTime,
    CheckInMethod checkInMethod,
    Long durationMinutes
) {
    public static AttendanceDTO from(Attendance a) {
        Long duration = null;
        if (a.getCheckInTime() != null && a.getCheckOutTime() != null) {
            duration = ChronoUnit.MINUTES.between(a.getCheckInTime(), a.getCheckOutTime());
        }
        return new AttendanceDTO(
            a.getId(), a.getMemberId(), a.getBranchId(),
            a.getCheckInTime(), a.getCheckOutTime(),
            a.getCheckInMethod(), duration
        );
    }
}
