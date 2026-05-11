package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.EmploymentType;
import com.gymapp.modules.trainer.TrainerStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TrainerDetailDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        String name,
        String email,
        String phone,
        String nic,
        String photoUrl,
        String bio,
        TrainerStatus status,
        EmploymentType employmentType,
        String primarySpecialty,
        List<String> specialties,
        Integer experienceYears,
        String rating,
        Integer totalReviews,
        Long salaryLkr,
        LocalDate joinedDate,
        long activeClientsCount,
        List<CertificationDTO> certifications,
        List<AvailabilityDTO> availability,
        List<AssignmentDTO> activeAssignments,
        List<PTSessionDTO> recentSessions,
        List<ReviewDTO> recentReviews,
        TrainerMonthlyStatsDTO monthlyStats,
        boolean isOnLeaveToday
) {}
