package com.gymapp.modules.shop;

import com.gymapp.modules.shop.entity.ProductCategory;
import com.gymapp.modules.shop.enums.ProductUnit;
import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "products")
@SQLRestriction("deleted_at IS NULL")
public class Product extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "category_id")
    private UUID categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private ProductCategory category;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 50)
    private String brand;

    @Column(length = 50)
    private String sku;

    @Column(length = 50)
    private String barcode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductUnit unit = ProductUnit.UNIT;

    @Column(name = "price_lkr", nullable = false)
    private Long priceLkr;

    @Column(name = "cost_price_lkr")
    private Long costPriceLkr;

    @Column(name = "stock_qty", nullable = false)
    private Integer stockQty = 0;

    @Column(name = "min_stock_qty", nullable = false)
    private Integer minStockQty = 5;

    @Column(name = "max_stock_qty")
    private Integer maxStockQty;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Transient
    public boolean isLowStock() {
        return stockQty != null && minStockQty != null && stockQty <= minStockQty && stockQty > 0;
    }

    @Transient
    public boolean isOutOfStock() {
        return stockQty != null && stockQty == 0;
    }
}
