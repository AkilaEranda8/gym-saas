package com.gymapp.modules.shop.entity;

import com.gymapp.multitenancy.TenantEntity;
import com.gymapp.modules.shop.ShopOrder;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItem extends TenantEntity {

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @Column(name = "product_sku", length = 50)
    private String productSku;

    @Column(name = "unit_price_lkr", nullable = false)
    private Long unitPriceLkr;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "discount_lkr", nullable = false)
    private Long discountLkr = 0L;

    @Column(name = "total_lkr", nullable = false)
    private Long totalLkr;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private ShopOrder order;
}
