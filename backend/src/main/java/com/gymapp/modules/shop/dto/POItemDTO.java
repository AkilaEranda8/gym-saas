package com.gymapp.modules.shop.dto;

import java.util.UUID;

public record POItemDTO(
    UUID id,
    UUID productId,
    String productName,
    String productSku,
    Integer quantityOrdered,
    Integer quantityReceived,
    Long unitCostLkr,
    String unitCostFormatted,
    Long totalCostLkr,
    String totalCostFormatted
) {}
