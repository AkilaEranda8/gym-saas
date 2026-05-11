package com.gymapp.modules.billing.dto;

import java.util.List;

public record ExpenseSummaryDTO(
        Long totalLkr,
        List<CategoryExpenseDTO> byCategory,
        List<MonthlyExpenseDTO> byMonth
) {
    public record CategoryExpenseDTO(
            String categoryId,
            String categoryName,
            String categoryColor,
            Long totalLkr,
            double percentage
    ) {}

    public record MonthlyExpenseDTO(
            String month,
            Long totalLkr
    ) {}
}
