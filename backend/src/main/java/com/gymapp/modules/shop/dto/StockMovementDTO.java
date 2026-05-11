package com.gymapp.modules.shop.dto;

import com.gymapp.modules.shop.enums.StockMovementType;
import com.gymapp.modules.shop.enums.StockReferenceType;

import java.time.LocalDateTime;
import java.util.UUID;

public record StockMovementDTO(
    UUID id,
    UUID productId,
    String productName,
    StockMovementType movementType,
    Integer quantity,
    Integer previousStock,
    Integer newStock,
    StockReferenceType referenceType,
    UUID referenceId,
    String notes,
    String createdBy,
    LocalDateTime createdAt
) {}
