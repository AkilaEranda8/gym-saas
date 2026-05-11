package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.InvoiceDTO;
import com.gymapp.modules.billing.dto.PaymentItemDTO;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepo;
    private final MemberRepository memberRepo;
    private final InvoicePdfGenerator pdfGenerator;

    @Transactional
    public Invoice generateForPayment(Payment payment, Member member) {
        Invoice invoice = new Invoice();
        invoice.setGymId(payment.getGymId());
        invoice.setPaymentId(payment.getId());
        invoice.setInvoiceNumber(generateInvoiceNumber(payment.getGymId()));
        invoice.setMemberId(payment.getMemberId());
        invoice.setSubtotalLkr(payment.getAmountLkr());
        invoice.setDiscountLkr(payment.getDiscountLkr());
        invoice.setTaxLkr(payment.getTaxLkr());
        invoice.setTotalLkr(payment.getFinalAmountLkr());
        invoice.setDueDate(payment.getDueDate());
        invoice.setFooterText("Thank you for your payment. Please retain this invoice for your records.");
        invoice = invoiceRepo.save(invoice);

        payment.setInvoiceNumber(invoice.getInvoiceNumber());

        try {
            InvoiceDTO dto = toDTO(invoice, payment, member);
            byte[] pdf = pdfGenerator.generate(dto);
            String url = "/api/v1/billing/invoices/" + invoice.getId() + "/pdf";
            invoice.setPdfUrl(url);
            invoiceRepo.save(invoice);
        } catch (Exception e) {
            log.error("Failed to generate invoice PDF: {}", e.getMessage());
        }

        return invoice;
    }

    public InvoiceDTO getById(UUID invoiceId) {
        UUID gymId = TenantContext.getGymId();
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .filter(i -> i.getGymId().equals(gymId))
                .orElseThrow(() -> new NoSuchElementException("Invoice not found"));
        Member member = memberRepo.findById(invoice.getMemberId()).orElse(null);
        return toDTO(invoice, null, member);
    }

    public byte[] generatePdf(UUID invoiceId) {
        UUID gymId = TenantContext.getGymId();
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .filter(i -> i.getGymId().equals(gymId))
                .orElseThrow(() -> new NoSuchElementException("Invoice not found"));
        Member member = memberRepo.findById(invoice.getMemberId()).orElse(null);
        try {
            return pdfGenerator.generate(toDTO(invoice, null, member));
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    public InvoiceDTO getByPaymentId(UUID paymentId) {
        Invoice invoice = invoiceRepo.findByPaymentId(paymentId)
                .orElseThrow(() -> new NoSuchElementException("Invoice not found"));
        Member member = memberRepo.findById(invoice.getMemberId()).orElse(null);
        return toDTO(invoice, null, member);
    }

    public Page<InvoiceDTO> listInvoices(LocalDateTime from, LocalDateTime to, Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        return invoiceRepo.findAllByGymIdAndIssuedAtBetween(gymId, from, to, pageable)
                .map(inv -> toDTO(inv, null, null));
    }

    private String generateInvoiceNumber(UUID gymId) {
        long count = invoiceRepo.count() + 1;
        return "INV" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyMM")) + String.format("%05d", count);
    }

    private InvoiceDTO toDTO(Invoice inv, Payment payment, Member member) {
        List<PaymentItemDTO> items = List.of();
        if (payment != null && payment.getItems() != null) {
            items = payment.getItems().stream()
                    .map(i -> new PaymentItemDTO(i.getId(), i.getDescription(),
                            i.getQuantity(), i.getUnitPriceLkr(), i.getTotalLkr()))
                    .collect(Collectors.toList());
        }
        String memberName = member != null ? member.getFirstName() + " " + member.getLastName() : null;
        String memberPhone = member != null ? member.getPhone() : null;
        return new InvoiceDTO(
                inv.getId(), inv.getInvoiceNumber(), inv.getPaymentId(), inv.getMemberId(),
                memberName, memberPhone, null, null, null, null, null, null, null,
                items, inv.getSubtotalLkr(), inv.getDiscountLkr(), inv.getTaxLkr(),
                inv.getTotalLkr(), inv.getFooterText(), inv.getNotes(),
                inv.getIssuedAt(), inv.getDueDate(), inv.getPdfUrl());
    }
}
