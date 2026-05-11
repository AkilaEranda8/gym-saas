package com.gymapp.modules.member.dto;

import com.gymapp.shared.enums.Gender;
import com.gymapp.shared.enums.MemberStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MemberDetailDTO(
    UUID id,
    UUID gymId,
    UUID branchId,
    String firstName,
    String lastName,
    String fullName,
    String email,
    String phone,
    String nic,
    String photoUrl,
    LocalDate dateOfBirth,
    Gender gender,
    String address,
    MemberStatus status,
    LocalDate joinDate,
    LocalDate expiryDate,
    String qrCode,
    UUID lockerId,
    UUID nutritionPlanId,
    String notes,
    LocalDateTime createdAt,
    BodyMetricDTO latestBodyMetric,
    List<AttendanceDTO> recentAttendance
) {}
