package com.gymapp.modules.member.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record PlanRequest(
    @NotBlank @Size(min = 2, max = 100) String name,
    String description,
    @NotNull @Min(1)                    Integer durationDays,
    @NotNull @DecimalMin("0.01")        BigDecimal price,
    String features,
    Integer maxFreezeDays
) {}
