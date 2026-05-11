package com.gymapp.modules.shop.dto;

import com.gymapp.modules.shop.enums.ProductUnit;

import java.time.LocalDateTime;
import java.util.UUID;

public record ProductDTO(
    UUID id,
    UUID gymId,
    UUID categoryId,
    String categoryName,
    String name,
    String description,
    String brand,
    String sku,
    String barcode,
    ProductUnit unit,
    Long priceLkr,
    String priceFormatted,
    Long costPriceLkr,
    Integer stockQty,
    Integer minStockQty,
    String stockStatus,
    String imageUrl,
    Boolean isActive,
    Boolean isFeatured,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
