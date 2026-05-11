package com.gymapp.modules.billing.dto;

import java.time.LocalDate;

public record BillingSummaryDTO(
        Long totalRevenueLkr,
        Long paidLkr,
        Long pendingLkr,
        Long failedLkr,
        Long refundedLkr,
        long totalTransactions,
        long paidCount,
        long pendingCount,
        long failedCount,
        long refundedCount,
        Long totalExpensesLkr,
        Long netProfitLkr,
        LocalDate periodFrom,
        LocalDate periodTo
) {}
