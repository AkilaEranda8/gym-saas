package com.gymapp.modules.member.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record AssignPlanRequest(
    @NotNull UUID planId,
    @NotNull LocalDate startDate
) {}
