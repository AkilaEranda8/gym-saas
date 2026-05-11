package com.gymapp.modules.classes.dto;

import jakarta.validation.constraints.*;

import java.time.LocalTime;

public record CreateScheduleRequest(
    @NotNull @Min(1) @Max(7) Integer dayOfWeek,
    @NotNull LocalTime startTime,
    @NotNull @Min(1) Integer maxCapacity
) {}
