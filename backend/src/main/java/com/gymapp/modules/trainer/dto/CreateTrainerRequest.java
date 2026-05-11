package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.EmploymentType;
import com.gymapp.modules.trainer.TrainerSpecialty;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateTrainerRequest(
        @NotBlank @Size(max = 100) String name,
        @Email @NotBlank String email,
        @NotBlank @Pattern(regexp = "^07[0-9]{8}$", message = "Invalid Sri Lankan phone") String phone,
        String nic,
        String bio,
        @NotEmpty List<TrainerSpecialty> specialties,
        List<String> certificationNames,
        @Min(0) @Max(50) Integer experienceYears,
        @NotNull EmploymentType employmentType,
        UUID branchId,
        Long salaryLkr,
        @NotNull LocalDate joinedDate,
        List<AvailabilityRequest> availability,
        boolean createAccount,
        String password
) {}
