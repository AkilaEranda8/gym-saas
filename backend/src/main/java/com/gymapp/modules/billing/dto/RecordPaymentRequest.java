package com.gymapp.modules.billing.dto;

import com.gymapp.modules.billing.PaymentMethod;
import com.gymapp.shared.enums.PaymentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record RecordPaymentRequest(
        @NotNull String memberId,
        @NotNull PaymentType paymentType,
        @NotNull @Min(1) Long amountLkr,
        String discountCode,
        @NotNull PaymentMethod method,
        String referenceNo,
        String description,
        String notes,
        LocalDate dueDate,
        @Valid List<PaymentItemRequest> items,
        boolean generateInvoice
) {
    public RecordPaymentRequest {
        if (generateInvoice == false && discountCode == null) {
            generateInvoice = true;
        }
    }
}
