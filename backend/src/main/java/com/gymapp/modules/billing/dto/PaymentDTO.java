package com.gymapp.modules.billing.dto;

import com.gymapp.modules.billing.PaymentMethod;
import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentDTO(
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
        Long finalAmountLkr,
        String finalAmountFormatted,
        PaymentMethod method,
        PaymentStatus status,
        String referenceNo,
        String description,
        LocalDateTime paidAt,
        LocalDate dueDate,
        LocalDateTime createdAt,
        String invoiceNumber,
        String invoiceUrl,
        boolean isOverdue
) {}
