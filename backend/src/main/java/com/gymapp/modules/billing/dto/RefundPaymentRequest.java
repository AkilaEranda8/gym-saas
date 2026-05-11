package com.gymapp.modules.billing.dto;

import jakarta.validation.constraints.NotBlank;

public record RefundPaymentRequest(
        @NotBlank String reason,
        Long refundAmount
) {}
