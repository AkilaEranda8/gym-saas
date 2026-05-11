package com.gymapp.modules.shop.dto;

import com.gymapp.modules.billing.PaymentMethod;
import com.gymapp.modules.shop.enums.OrderStatus;
import com.gymapp.modules.shop.enums.ShopPaymentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ShopOrderDTO(
    UUID id,
    UUID gymId,
    UUID memberId,
    String memberName,
    String memberPhone,
    String orderNumber,
    OrderStatus status,
    Long subtotalLkr,
    Long discountLkr,
    Long taxLkr,
    Long totalLkr,
    String totalFormatted,
    PaymentMethod paymentMethod,
    ShopPaymentStatus paymentStatus,
    String discountCode,
    String notes,
    String receiptUrl,
    String createdBy,
    String refundReason,
    LocalDateTime refundedAt,
    List<OrderItemDTO> items,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
