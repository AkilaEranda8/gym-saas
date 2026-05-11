package com.gymapp.modules.member.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AddBodyMetricRequest(
    @NotNull @DecimalMin("20.0") @DecimalMax("300.0") BigDecimal weightKg,
    @DecimalMin("100.0") @DecimalMax("250.0") BigDecimal heightCm,
    @DecimalMin("1.0") @DecimalMax("60.0") BigDecimal bodyFatPct,
    @DecimalMin("0.0") BigDecimal muscleMassKg,
    @DecimalMin("0.0") BigDecimal chestCm,
    @DecimalMin("0.0") BigDecimal waistCm,
    @DecimalMin("0.0") BigDecimal hipCm,
    String notes
) {}
