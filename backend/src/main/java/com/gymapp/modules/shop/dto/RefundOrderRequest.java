package com.gymapp.modules.shop.dto;

import jakarta.validation.constraints.NotBlank;

public record RefundOrderRequest(
    @NotBlank String reason,
    boolean restockItems
) {
    public RefundOrderRequest {
        if (!restockItems) restockItems = true;
    }
}
