package com.gymapp.modules.shop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
    @NotBlank @Size(max = 50) String name,
    String description,
    String icon,
    String color,
    Integer sortOrder
) {
    public CreateCategoryRequest {
        if (sortOrder == null) sortOrder = 0;
    }
}
