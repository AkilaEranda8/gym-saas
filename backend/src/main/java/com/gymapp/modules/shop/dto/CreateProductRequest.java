package com.gymapp.modules.shop.dto;

import com.gymapp.modules.shop.enums.ProductUnit;
import jakarta.validation.constraints.*;

public record CreateProductRequest(
    @NotBlank @Size(max = 100) String name,
    String description,
    String brand,
    @NotBlank String categoryId,
    String sku,
    String barcode,
    ProductUnit unit,
    @NotNull @Min(1) Long priceLkr,
    Long costPriceLkr,
    @NotNull @Min(0) Integer stockQty,
    Integer minStockQty,
    Integer maxStockQty,
    Boolean isActive,
    Boolean isFeatured,
    String branchId,
    String imageUrl
) {
    public CreateProductRequest {
        if (unit == null) unit = ProductUnit.UNIT;
        if (isActive == null) isActive = true;
        if (isFeatured == null) isFeatured = false;
        if (minStockQty == null) minStockQty = 5;
        if (stockQty == null) stockQty = 0;
    }
}
