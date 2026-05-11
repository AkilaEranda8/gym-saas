package com.gymapp.modules.shop.dto;

import com.gymapp.modules.shop.enums.StockMovementType;
import jakarta.validation.constraints.NotNull;

public record UpdateStockRequest(
    @NotNull Integer quantity,
    @NotNull StockMovementType movementType,
    String notes
) {}
