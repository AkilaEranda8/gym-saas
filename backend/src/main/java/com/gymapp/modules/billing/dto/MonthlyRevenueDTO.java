package com.gymapp.modules.billing.dto;

public record MonthlyRevenueDTO(
        String month,
        Long revenueLkr,
        Long expensesLkr,
        Long netProfitLkr,
        long transactionCount
) {}
