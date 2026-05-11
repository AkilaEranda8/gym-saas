package com.gymapp.modules.classes.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreateSessionRequest(
    @NotNull UUID classId,
    @NotNull @Future LocalDate sessionDate,
    @NotNull LocalTime startTime,
    UUID trainerId,
    Integer actualCapacity,
    String notes
) {}
