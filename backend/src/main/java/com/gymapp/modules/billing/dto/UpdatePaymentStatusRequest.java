package com.gymapp.modules.billing.dto;

import com.gymapp.shared.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdatePaymentStatusRequest(
        @NotNull PaymentStatus status,
        String referenceNo,
        String notes
) {}
