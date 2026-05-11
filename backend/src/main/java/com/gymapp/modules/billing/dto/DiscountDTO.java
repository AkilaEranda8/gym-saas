package com.gymapp.modules.billing.dto;

import com.gymapp.modules.billing.DiscountType;

import java.time.LocalDate;
import java.util.UUID;

public record DiscountDTO(
        UUID id,
        UUID gymId,
        String code,
        String description,
        DiscountType discountType,
        Long discountValue,
        Integer maxUses,
        Integer usedCount,
        Integer remainingUses,
        LocalDate validFrom,
        LocalDate validUntil,
        boolean isActive,
        boolean isExpired
) {}
