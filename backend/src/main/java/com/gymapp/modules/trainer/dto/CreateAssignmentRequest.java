package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.AssignmentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateAssignmentRequest(
        @NotNull UUID trainerId,
        @NotNull UUID memberId,
        @NotNull AssignmentType assignmentType,
        @NotNull LocalDate startedDate,
        @NotNull @Min(1) Integer sessionsTotal,
        String notes
) {}
