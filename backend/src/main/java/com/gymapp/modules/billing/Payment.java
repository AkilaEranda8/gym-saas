package com.gymapp.modules.billing;

import com.gymapp.multitenancy.TenantEntity;
import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "payments")
@SQLRestriction("deleted_at IS NULL")
public class Payment extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "payment_number", nullable = false, length = 20)
    private String paymentNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType;

    @Column(name = "amount_lkr", nullable = false)
    private Long amountLkr;

    @Column(name = "discount_lkr", nullable = false)
    private Long discountLkr = 0L;

    @Column(name = "tax_lkr", nullable = false)
    private Long taxLkr = 0L;

    @Column(name = "final_amount_lkr", nullable = false)
    private Long finalAmountLkr;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "reference_no", length = 100)
    private String referenceNo;

    @Column(name = "payhere_order_id", length = 100)
    private String payhereOrderId;

    @Column(name = "payhere_status", length = 50)
    private String payhereStatus;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "invoice_number", length = 20)
    private String invoiceNumber;

    @Column(name = "invoice_url", length = 255)
    private String invoiceUrl;

    @Column(name = "refund_reason", columnDefinition = "TEXT")
    private String refundReason;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PaymentItem> items = new ArrayList<>();

    public void addItem(PaymentItem item) {
        item.setPaymentId(this.getId() != null ? this.getId() : null);
        item.setGymId(this.getGymId());
        item.setPayment(this);
        items.add(item);
    }
}
