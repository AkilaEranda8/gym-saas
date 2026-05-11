package com.gymapp.modules.billing.dto;

import java.util.UUID;

public record ExpenseCategoryDTO(
        UUID id,
        UUID gymId,
        String name,
        String color
) {}
