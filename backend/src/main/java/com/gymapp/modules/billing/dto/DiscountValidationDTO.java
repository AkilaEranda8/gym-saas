package com.gymapp.modules.billing.dto;

import com.gymapp.modules.billing.DiscountType;

public record DiscountValidationDTO(
        boolean valid,
        String code,
        DiscountType discountType,
        Long discountValue,
        Long discountLkr,
        Long finalAmountLkr,
        String message
) {}
