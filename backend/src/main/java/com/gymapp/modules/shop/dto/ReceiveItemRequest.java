package com.gymapp.modules.shop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReceiveItemRequest(
    @NotBlank String poItemId,
    @NotNull @Min(0) Integer quantityReceived
) {}
