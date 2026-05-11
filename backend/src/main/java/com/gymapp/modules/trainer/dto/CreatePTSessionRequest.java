package com.gymapp.modules.trainer.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreatePTSessionRequest(
        @NotNull UUID trainerId,
        @NotNull UUID memberId,
        UUID assignmentId,
        @NotNull @FutureOrPresent LocalDate sessionDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        String notes
) {}
