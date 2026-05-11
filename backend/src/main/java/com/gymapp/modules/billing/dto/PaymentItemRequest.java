package com.gymapp.modules.billing.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record PaymentItemRequest(
        @NotBlank String description,
        @Min(1) Integer quantity,
        @Min(1) Long unitPriceLkr
) {}
