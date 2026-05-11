package com.gymapp.modules.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ValidateDiscountRequest(
        @NotBlank String code,
        @NotNull Long amountLkr
) {}
