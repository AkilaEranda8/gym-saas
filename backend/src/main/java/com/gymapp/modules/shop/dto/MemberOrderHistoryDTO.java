package com.gymapp.modules.shop.dto;

import com.gymapp.modules.billing.PaymentMethod;
import com.gymapp.modules.shop.enums.OrderStatus;
import com.gymapp.modules.shop.enums.ShopPaymentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MemberOrderHistoryDTO(
    UUID id,
    String orderNumber,
    OrderStatus status,
    Long totalLkr,
    String totalFormatted,
    PaymentMethod paymentMethod,
    ShopPaymentStatus paymentStatus,
    String receiptUrl,
    List<OrderItemDTO> items,
    LocalDateTime createdAt
) {}
