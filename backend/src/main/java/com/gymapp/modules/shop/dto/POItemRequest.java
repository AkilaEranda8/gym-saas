package com.gymapp.modules.shop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record POItemRequest(
    @NotBlank String productId,
    @NotNull @Min(1) Integer quantityOrdered,
    @NotNull @Min(1) Long unitCostLkr
) {}
