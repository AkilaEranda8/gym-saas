package com.gymapp.modules.billing.dto;

import com.gymapp.shared.enums.PaymentType;
import jakarta.validation.constraints.NotNull;

public record InitiatePayhereRequest(
        @NotNull String memberId,
        @NotNull Long amountLkr,
        @NotNull PaymentType paymentType,
        String description
) {}
