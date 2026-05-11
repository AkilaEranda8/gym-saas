package com.gymapp.modules.billing;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "payhere_transactions")
public class PayhereTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "payment_id")
    private UUID paymentId;

    @Column(name = "order_id", nullable = false, length = 100)
    private String orderId;

    @Column(name = "payhere_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal payhereAmount;

    @Column(name = "payhere_currency", length = 10)
    private String payhereCurrency = "LKR";

    @Column(name = "status_code", length = 10)
    private String statusCode;

    @Column(name = "status_message", length = 100)
    private String statusMessage;

    @Column(length = 50)
    private String method;

    @Column(name = "card_holder", length = 100)
    private String cardHolder;

    @Column(name = "card_no", length = 20)
    private String cardNo;

    @Column(name = "raw_response", columnDefinition = "jsonb")
    private String rawResponse;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt = LocalDateTime.now();
}
