package com.gymapp.modules.shop.dto;

import java.util.UUID;

public record LowStockAlertDTO(
    UUID productId,
    String productName,
    String categoryName,
    String sku,
    int currentStock,
    int minStockQty,
    String stockStatus
) {}
