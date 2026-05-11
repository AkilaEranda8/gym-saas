package com.gymapp.modules.shop.dto;

import com.gymapp.modules.shop.enums.ProductUnit;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateProductRequest(
    @Size(max = 100) String name,
    String description,
    String brand,
    String categoryId,
    String sku,
    String barcode,
    ProductUnit unit,
    @Min(1) Long priceLkr,
    Long costPriceLkr,
    @Min(0) Integer minStockQty,
    Integer maxStockQty,
    Boolean isActive,
    Boolean isFeatured,
    String branchId,
    String imageUrl
) {}
