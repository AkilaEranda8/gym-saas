package com.gymapp.modules.billing.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateExpenseCategoryRequest(
        @NotBlank String name,
        String color
) {}
