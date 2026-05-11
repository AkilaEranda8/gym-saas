package com.gymapp.modules.billing.dto;

import com.gymapp.modules.billing.DiscountType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateDiscountRequest(
        @NotBlank @Size(max = 20) String code,
        String description,
        @NotNull DiscountType discountType,
        @NotNull @Min(1) Long discountValue,
        Integer maxUses,
        @NotNull LocalDate validFrom,
        LocalDate validUntil
) {}
