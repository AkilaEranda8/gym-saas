package com.gymapp.modules.billing;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(name = "invoice_number", nullable = false, length = 20)
    private String invoiceNumber;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "subtotal_lkr", nullable = false)
    private Long subtotalLkr;

    @Column(name = "discount_lkr", nullable = false)
    private Long discountLkr = 0L;

    @Column(name = "tax_lkr", nullable = false)
    private Long taxLkr = 0L;

    @Column(name = "total_lkr", nullable = false)
    private Long totalLkr;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "footer_text", columnDefinition = "TEXT")
    private String footerText;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "pdf_url", length = 255)
    private String pdfUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
