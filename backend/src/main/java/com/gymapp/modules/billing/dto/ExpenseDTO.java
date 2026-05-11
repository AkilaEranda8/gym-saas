package com.gymapp.modules.billing.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ExpenseDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        UUID categoryId,
        String categoryName,
        String categoryColor,
        String description,
        Long amountLkr,
        LocalDate expenseDate,
        String receiptUrl,
        String paidBy,
        String notes
) {}
