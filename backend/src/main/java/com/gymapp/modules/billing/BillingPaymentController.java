package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.*;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing/payments")
@RequiredArgsConstructor
public class BillingPaymentController {

    private final NewPaymentService paymentService;
    private final BillingReminderService reminderService;
    private final CurrentUser currentUser;

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<PaymentDetailDTO>> record(
            @Valid @RequestBody RecordPaymentRequest req) {
        return ResponseEntity.status(201).body(
                ApiResponse.created(paymentService.recordPayment(req, currentUser.getEmail())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> list(
            @RequestParam(required = false) UUID memberId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        com.gymapp.shared.enums.PaymentStatus ps = status != null
                ? com.gymapp.shared.enums.PaymentStatus.valueOf(status) : null;
        com.gymapp.shared.enums.PaymentType pt = type != null
                ? com.gymapp.shared.enums.PaymentType.valueOf(type) : null;
        PaymentMethod pm = method != null ? PaymentMethod.valueOf(method) : null;
        return ResponseEntity.ok(ApiResponse.ok(
                paymentService.listPayments(memberId, ps, pt, pm, from, to, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PaymentDetailDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getById(id)));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> memberPayments(
            @PathVariable UUID memberId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getMemberPayments(memberId, pageable)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<PaymentDetailDTO>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePaymentStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.updateStatus(id, req)));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<PaymentDetailDTO>> refund(
            @PathVariable UUID id,
            @Valid @RequestBody RefundPaymentRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.refundPayment(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> softDelete(@PathVariable UUID id) {
        paymentService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Payment deleted", null));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<BillingSummaryDTO>> summary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getSummary(from, to)));
    }

    @GetMapping("/monthly-revenue")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<MonthlyRevenueDTO>>> monthlyRevenue(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getMonthlyRevenue(months)));
    }

    @GetMapping("/revenue-by-type")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<RevenueByTypeDTO>>> revenueByType(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getRevenueByType(from, to)));
    }
}
