package com.gymapp.modules.billing.dto;

import com.gymapp.modules.billing.PaymentMethod;
import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PaymentDetailDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        UUID memberId,
        String memberName,
        String memberPhone,
        String paymentNumber,
        PaymentType paymentType,
        Long amountLkr,
        Long discountLkr,
        Long taxLkr,
        Long finalAmountLkr,
        String finalAmountFormatted,
        PaymentMethod method,
        PaymentStatus status,
        String referenceNo,
        String payhereOrderId,
        String description,
        String notes,
        LocalDateTime paidAt,
        LocalDate dueDate,
        LocalDateTime createdAt,
        String invoiceNumber,
        String invoiceUrl,
        String refundReason,
        LocalDateTime refundedAt,
        String createdBy,
        boolean isOverdue,
        List<PaymentItemDTO> items
) {}
