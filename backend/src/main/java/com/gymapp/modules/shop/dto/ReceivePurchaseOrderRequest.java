package com.gymapp.modules.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ReceivePurchaseOrderRequest(
    @NotEmpty @Valid List<ReceiveItemRequest> items,
    String notes
) {}
