package com.gymapp.modules.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreatePurchaseOrderRequest(
    @NotBlank String supplierName,
    String supplierPhone,
    String branchId,
    String notes,
    @NotEmpty @Valid List<POItemRequest> items
) {}
