package com.gymapp.modules.locker;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class LockerDtos {

    public record LockerDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        String lockerNumber,
        String size,
        BigDecimal monthlyRate,
        String status,
        String assignedTo,
        UUID assignedMemberId,
        LocalDate assignmentEnd
    ) {}

    public record LockerAssignmentDTO(
        UUID id,
        UUID lockerId,
        String lockerNumber,
        String lockerSize,
        UUID memberId,
        String memberName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal monthlyRate,
        String status,
        boolean expired
    ) {}

    public record LockerStatsDTO(
        long total,
        long available,
        long occupied,
        long maintenance,
        long activeAssignments,
        long expiringThisWeek,
        BigDecimal monthlyRevenue
    ) {}

    public record CreateLockerRequest(
        String lockerNumber,
        String size,
        BigDecimal monthlyRate,
        UUID branchId
    ) {}

    public record AssignLockerRequest(
        UUID memberId,
        LocalDate endDate
    ) {}

    public record UpdateLockerRequest(
        String lockerNumber,
        String size,
        BigDecimal monthlyRate,
        String status
    ) {}
}
