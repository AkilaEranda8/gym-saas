package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.EmploymentType;
import com.gymapp.modules.trainer.TrainerStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TrainerDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        String name,
        String email,
        String phone,
        String photoUrl,
        TrainerStatus status,
        EmploymentType employmentType,
        String primarySpecialty,
        List<String> specialties,
        Integer experienceYears,
        String rating,
        Integer totalReviews,
        long activeClientsCount,
        long classesThisWeek,
        LocalDate joinedDate
) {}
