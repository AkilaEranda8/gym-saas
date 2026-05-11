package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.InvoiceDTO;
import com.gymapp.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing/invoices")
@RequiredArgsConstructor
public class BillingInvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<InvoiceDTO>>> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(invoiceService.listInvoices(from, to, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'MEMBER')")
    public ResponseEntity<ApiResponse<InvoiceDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(invoiceService.getById(id)));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'MEMBER')")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id) {
        byte[] pdf = invoiceService.generatePdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice-" + id + ".pdf\"")
                .body(pdf);
    }

    @GetMapping("/by-payment/{paymentId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'MEMBER')")
    public ResponseEntity<ApiResponse<InvoiceDTO>> getByPayment(@PathVariable UUID paymentId) {
        return ResponseEntity.ok(ApiResponse.ok(invoiceService.getByPaymentId(paymentId)));
    }
}
