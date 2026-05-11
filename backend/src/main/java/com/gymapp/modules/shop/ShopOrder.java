package com.gymapp.modules.shop;

import com.gymapp.modules.billing.PaymentMethod;
import com.gymapp.modules.shop.entity.OrderItem;
import com.gymapp.modules.shop.enums.OrderStatus;
import com.gymapp.modules.shop.enums.ShopPaymentStatus;
import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "shop_orders")
@SQLRestriction("deleted_at IS NULL")
public class ShopOrder extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "member_id")
    private UUID memberId;

    @Column(name = "order_number", nullable = false, unique = true, length = 20)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.COMPLETED;

    @Column(name = "subtotal_lkr", nullable = false)
    private Long subtotalLkr;

    @Column(name = "discount_lkr", nullable = false)
    private Long discountLkr = 0L;

    @Column(name = "tax_lkr", nullable = false)
    private Long taxLkr = 0L;

    @Column(name = "total_lkr", nullable = false)
    private Long totalLkr;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private ShopPaymentStatus paymentStatus = ShopPaymentStatus.PAID;

    @Column(name = "discount_code", length = 20)
    private String discountCode;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "receipt_url", length = 255)
    private String receiptUrl;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "refund_reason", columnDefinition = "text")
    private String refundReason;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
