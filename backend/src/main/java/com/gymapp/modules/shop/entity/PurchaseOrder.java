package com.gymapp.modules.shop.entity;

import com.gymapp.modules.shop.enums.PurchaseOrderStatus;
import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "po_number", nullable = false, unique = true, length = 20)
    private String poNumber;

    @Column(name = "supplier_name", length = 100)
    private String supplierName;

    @Column(name = "supplier_phone", length = 20)
    private String supplierPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PurchaseOrderStatus status = PurchaseOrderStatus.PENDING;

    @Column(name = "total_lkr", nullable = false)
    private Long totalLkr = 0L;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt = LocalDateTime.now();

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items = new ArrayList<>();
}
