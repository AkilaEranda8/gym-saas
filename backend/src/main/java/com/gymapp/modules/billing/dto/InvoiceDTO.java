package com.gymapp.modules.billing.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record InvoiceDTO(
        UUID id,
        String invoiceNumber,
        UUID paymentId,
        UUID memberId,
        String memberName,
        String memberPhone,
        String memberNic,
        String memberAddress,
        String gymName,
        String gymPhone,
        String gymAddress,
        String gymLogoUrl,
        String gymTaxNo,
        List<PaymentItemDTO> items,
        Long subtotalLkr,
        Long discountLkr,
        Long taxLkr,
        Long totalLkr,
        String footerText,
        String notes,
        LocalDateTime issuedAt,
        LocalDate dueDate,
        String pdfUrl
) {}
