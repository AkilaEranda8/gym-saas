package com.gymapp.modules.shop.dto;

import com.gymapp.modules.billing.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderRequest(
    String memberId,
    @NotEmpty @Valid List<OrderItemRequest> items,
    @NotNull PaymentMethod paymentMethod,
    String discountCode,
    String notes
) {}
