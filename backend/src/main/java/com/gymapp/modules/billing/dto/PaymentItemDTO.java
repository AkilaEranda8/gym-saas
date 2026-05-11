package com.gymapp.modules.billing.dto;

import java.util.UUID;

public record PaymentItemDTO(
        UUID id,
        String description,
        Integer quantity,
        Long unitPriceLkr,
        Long totalLkr
) {}
