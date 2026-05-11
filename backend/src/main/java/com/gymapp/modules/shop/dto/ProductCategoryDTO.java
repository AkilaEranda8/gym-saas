package com.gymapp.modules.shop.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProductCategoryDTO(
    UUID id,
    UUID gymId,
    String name,
    String description,
    String icon,
    String color,
    Integer sortOrder,
    Boolean isActive,
    long productCount,
    LocalDateTime createdAt
) {}
