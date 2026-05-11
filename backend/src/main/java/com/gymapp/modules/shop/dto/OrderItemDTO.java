package com.gymapp.modules.shop.dto;

import java.util.UUID;

public record OrderItemDTO(
    UUID id,
    UUID productId,
    String productName,
    String productSku,
    Long unitPriceLkr,
    String unitPriceFormatted,
    Integer quantity,
    Long discountLkr,
    Long totalLkr,
    String totalFormatted
) {}
