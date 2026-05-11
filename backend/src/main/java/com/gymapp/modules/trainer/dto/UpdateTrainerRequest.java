package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.EmploymentType;
import com.gymapp.modules.trainer.TrainerSpecialty;
import com.gymapp.modules.trainer.TrainerStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UpdateTrainerRequest(
        String name,
        @Email String email,
        @Pattern(regexp = "^07[0-9]{8}$") String phone,
        String nic,
        String bio,
        List<TrainerSpecialty> specialties,
        @Min(0) @Max(50) Integer experienceYears,
        EmploymentType employmentType,
        UUID branchId,
        Long salaryLkr,
        LocalDate joinedDate,
        TrainerStatus status,
        List<AvailabilityRequest> availability
) {}
