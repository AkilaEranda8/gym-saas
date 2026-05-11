package com.gymapp.modules.shop.entity;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "purchase_order_items")
public class PurchaseOrderItem extends TenantEntity {

    @Column(name = "po_id", nullable = false)
    private UUID poId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    @Column(name = "quantity_ordered", nullable = false)
    private Integer quantityOrdered;

    @Column(name = "quantity_received", nullable = false)
    private Integer quantityReceived = 0;

    @Column(name = "unit_cost_lkr", nullable = false)
    private Long unitCostLkr;

    @Column(name = "total_cost_lkr", nullable = false)
    private Long totalCostLkr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", insertable = false, updatable = false)
    private PurchaseOrder purchaseOrder;
}
