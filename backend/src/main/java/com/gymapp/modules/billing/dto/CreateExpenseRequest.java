package com.gymapp.modules.billing.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateExpenseRequest(
        @NotBlank String description,
        @NotNull @Min(1) Long amountLkr,
        @NotNull LocalDate expenseDate,
        String categoryId,
        String branchId,
        String receiptUrl,
        String paidBy,
        String notes
) {}
