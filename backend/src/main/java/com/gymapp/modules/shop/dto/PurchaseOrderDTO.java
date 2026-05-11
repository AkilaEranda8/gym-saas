package com.gymapp.modules.shop.dto;

import com.gymapp.modules.shop.enums.PurchaseOrderStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PurchaseOrderDTO(
    UUID id,
    UUID gymId,
    String poNumber,
    String supplierName,
    String supplierPhone,
    PurchaseOrderStatus status,
    Long totalLkr,
    String totalFormatted,
    String notes,
    List<POItemDTO> items,
    LocalDateTime orderedAt,
    LocalDateTime receivedAt,
    LocalDateTime createdAt
) {}
