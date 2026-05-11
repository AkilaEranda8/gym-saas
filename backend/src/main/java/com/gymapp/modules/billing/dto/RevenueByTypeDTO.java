package com.gymapp.modules.billing.dto;

import com.gymapp.shared.enums.PaymentType;

public record RevenueByTypeDTO(
        PaymentType paymentType,
        Long totalLkr,
        long count,
        double percentage
) {}
