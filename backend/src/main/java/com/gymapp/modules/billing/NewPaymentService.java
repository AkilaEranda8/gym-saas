package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.*;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewPaymentService {

    private final PaymentRepository paymentRepo;
    private final MemberRepository memberRepo;
    private final DiscountRepository discountRepo;
    private final InvoiceService invoiceService;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public PaymentDetailDTO recordPayment(RecordPaymentRequest req, String createdBy) {
        UUID gymId = TenantContext.getGymId();
        Member member = memberRepo.findByIdAndGymId(UUID.fromString(req.memberId()), gymId)
                .orElseThrow(() -> new NoSuchElementException("Member not found"));

        long discountLkr = 0L;
        if (req.discountCode() != null && !req.discountCode().isBlank()) {
            Discount discount = discountRepo.findByGymIdAndCodeAndIsActiveTrue(gymId, req.discountCode())
                    .orElse(null);
            if (discount != null && isDiscountValid(discount)) {
                discountLkr = calculateDiscount(discount, req.amountLkr());
                discount.setUsedCount(discount.getUsedCount() + 1);
                discountRepo.save(discount);
            }
        }

        long finalAmount = req.amountLkr() - discountLkr;
        if (finalAmount < 0) finalAmount = 0;

        Payment payment = new Payment();
        payment.setGymId(gymId);
        payment.setMemberId(member.getId());
        payment.setPaymentNumber(generatePaymentNumber(gymId));
        payment.setPaymentType(req.paymentType());
        payment.setAmountLkr(req.amountLkr());
        payment.setDiscountLkr(discountLkr);
        payment.setFinalAmountLkr(finalAmount);
        payment.setMethod(req.method());
        payment.setDescription(req.description());
        payment.setNotes(req.notes());
        payment.setDueDate(req.dueDate());
        payment.setCreatedBy(createdBy);

        if (req.method() != PaymentMethod.PAYHERE) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
        } else {
            payment.setStatus(PaymentStatus.PENDING);
        }

        if (req.items() != null && !req.items().isEmpty()) {
            List<PaymentItem> items = req.items().stream().map(ir -> {
                PaymentItem item = new PaymentItem();
                item.setGymId(gymId);
                item.setDescription(ir.description());
                item.setQuantity(ir.quantity() != null ? ir.quantity() : 1);
                item.setUnitPriceLkr(ir.unitPriceLkr());
                item.setTotalLkr((long) item.getQuantity() * ir.unitPriceLkr());
                return item;
            }).collect(Collectors.toList());
            items.forEach(payment::addItem);
        }

        payment = paymentRepo.save(payment);

        if (req.generateInvoice() && payment.getStatus() == PaymentStatus.PAID) {
            invoiceService.generateForPayment(payment, member);
        }

        publishPaymentNotification(payment, member);
        return toDetail(payment, member);
    }

    @Transactional
    public PaymentDetailDTO updateStatus(UUID paymentId, UpdatePaymentStatusRequest req) {
        UUID gymId = TenantContext.getGymId();
        Payment payment = paymentRepo.findByIdAndGymId(paymentId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Payment not found"));
        payment.setStatus(req.status());
        if (req.status() == PaymentStatus.PAID && payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDateTime.now());
        }
        if (req.referenceNo() != null) payment.setReferenceNo(req.referenceNo());
        if (req.notes() != null) payment.setNotes(req.notes());
        payment = paymentRepo.save(payment);
        Member member = memberRepo.findById(payment.getMemberId()).orElse(null);
        return toDetail(payment, member);
    }

    @Transactional
    public PaymentDetailDTO refundPayment(UUID paymentId, RefundPaymentRequest req) {
        UUID gymId = TenantContext.getGymId();
        Payment payment = paymentRepo.findByIdAndGymId(paymentId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Payment not found"));
        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new IllegalStateException("Only PAID payments can be refunded");
        }
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundReason(req.reason());
        payment.setRefundedAt(LocalDateTime.now());
        payment = paymentRepo.save(payment);
        Member member = memberRepo.findById(payment.getMemberId()).orElse(null);
        return toDetail(payment, member);
    }

    public Page<PaymentDTO> listPayments(UUID memberId, PaymentStatus status, PaymentType type,
                                          PaymentMethod method, LocalDateTime from, LocalDateTime to,
                                          Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime effectiveFrom = from != null ? from : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime effectiveTo   = to   != null ? to   : LocalDateTime.of(2099, 12, 31, 23, 59, 59);
        return paymentRepo.findAllWithFilters(gymId, memberId, status, type, method, effectiveFrom, effectiveTo, pageable)
                .map(p -> toDTO(p, null));
    }

    public PaymentDetailDTO getById(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Payment payment = paymentRepo.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NoSuchElementException("Payment not found"));
        Member member = memberRepo.findById(payment.getMemberId()).orElse(null);
        return toDetail(payment, member);
    }

    public Page<PaymentDTO> getMemberPayments(UUID memberId, Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        return paymentRepo.findByGymIdAndMemberIdOrderByCreatedAtDesc(gymId, memberId, pageable)
                .map(p -> toDTO(p, null));
    }

    public BillingSummaryDTO getSummary(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo   = to.atTime(23, 59, 59);

        Long paid    = paymentRepo.sumByGymIdAndStatusPaidAndPaidAtBetween(gymId, dtFrom, dtTo);
        long paidCnt = paymentRepo.countByGymIdAndStatus(gymId, PaymentStatus.PAID);
        long pendCnt = paymentRepo.countByGymIdAndStatus(gymId, PaymentStatus.PENDING);
        long failCnt = paymentRepo.countByGymIdAndStatus(gymId, PaymentStatus.FAILED);
        long refdCnt = paymentRepo.countByGymIdAndStatus(gymId, PaymentStatus.REFUNDED);

        return new BillingSummaryDTO(
                paid != null ? paid : 0L, paid != null ? paid : 0L, 0L, 0L, 0L,
                paidCnt + pendCnt + failCnt + refdCnt,
                paidCnt, pendCnt, failCnt, refdCnt,
                0L, paid != null ? paid : 0L, from, to);
    }

    public List<MonthlyRevenueDTO> getMonthlyRevenue(int months) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime to   = LocalDateTime.now();
        LocalDateTime from = to.minusMonths(months);
        List<Object[]> rows = paymentRepo.getMonthlyRevenueSummary(gymId, from, to);
        return rows.stream().map(r -> new MonthlyRevenueDTO(
                (String) r[0],
                r[1] instanceof Long ? (Long) r[1] : ((Number) r[1]).longValue(),
                0L, 0L,
                r[2] instanceof Long ? (Long) r[2] : ((Number) r[2]).longValue()
        )).collect(Collectors.toList());
    }

    public List<RevenueByTypeDTO> getRevenueByType(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        List<Object[]> rows = paymentRepo.getRevenueByType(gymId, from.atStartOfDay(), to.atTime(23,59,59));
        long totalRevenue = rows.stream().mapToLong(r -> ((Number) r[1]).longValue()).sum();
        return rows.stream().map(r -> {
            long amount = ((Number) r[1]).longValue();
            return new RevenueByTypeDTO(
                    (PaymentType) r[0], amount,
                    ((Number) r[2]).longValue(),
                    totalRevenue > 0 ? (double) amount / totalRevenue * 100 : 0.0
            );
        }).collect(Collectors.toList());
    }

    public void softDelete(UUID paymentId) {
        UUID gymId = TenantContext.getGymId();
        Payment payment = paymentRepo.findByIdAndGymId(paymentId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Payment not found"));
        payment.setDeletedAt(LocalDateTime.now());
        paymentRepo.save(payment);
    }

    private String generatePaymentNumber(UUID gymId) {
        Integer maxSeq = paymentRepo.findMaxSequenceByGymId(gymId);
        int seq = (maxSeq != null ? maxSeq : 0) + 1;
        return "PAY" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyMM")) + String.format("%05d", seq);
    }

    private long calculateDiscount(Discount d, long amount) {
        return d.getDiscountType() == DiscountType.PERCENTAGE
                ? (long) (amount * d.getDiscountValue() / 100.0)
                : Math.min(d.getDiscountValue(), amount);
    }

    private boolean isDiscountValid(Discount d) {
        LocalDate now = LocalDate.now();
        if (!d.getIsActive()) return false;
        if (now.isBefore(d.getValidFrom())) return false;
        if (d.getValidUntil() != null && now.isAfter(d.getValidUntil())) return false;
        if (d.getMaxUses() != null && d.getUsedCount() >= d.getMaxUses()) return false;
        return true;
    }

    private void publishPaymentNotification(Payment p, Member m) {
        try {
            Map<String, Object> msg = Map.of(
                    "type", "PAYMENT_RECEIVED",
                    "memberId", p.getMemberId(),
                    "memberName", m.getFirstName() + " " + m.getLastName(),
                    "amount", formatLkr(p.getFinalAmountLkr()),
                    "paymentNumber", p.getPaymentNumber()
            );
            rabbitTemplate.convertAndSend("gym.notifications", "notification.payment", msg);
        } catch (Exception e) {
            log.warn("Failed to publish payment notification: {}", e.getMessage());
        }
    }

    public PaymentDTO toDTO(Payment p, Member member) {
        String name = member != null ? member.getFirstName() + " " + member.getLastName() : null;
        String phone = member != null ? member.getPhone() : null;
        boolean overdue = p.getDueDate() != null && p.getStatus() == PaymentStatus.PENDING
                && LocalDate.now().isAfter(p.getDueDate());
        return new PaymentDTO(p.getId(), p.getGymId(), p.getBranchId(), p.getMemberId(),
                name, phone, p.getPaymentNumber(), p.getPaymentType(),
                p.getAmountLkr(), p.getDiscountLkr(), p.getFinalAmountLkr(),
                formatLkr(p.getFinalAmountLkr()), p.getMethod(), p.getStatus(),
                p.getReferenceNo(), p.getDescription(), p.getPaidAt(), p.getDueDate(),
                p.getCreatedAt(), p.getInvoiceNumber(), p.getInvoiceUrl(), overdue);
    }

    public PaymentDetailDTO toDetail(Payment p, Member member) {
        String name = member != null ? member.getFirstName() + " " + member.getLastName() : null;
        String phone = member != null ? member.getPhone() : null;
        boolean overdue = p.getDueDate() != null && p.getStatus() == PaymentStatus.PENDING
                && LocalDate.now().isAfter(p.getDueDate());
        List<PaymentItemDTO> itemDTOs = p.getItems().stream()
                .map(i -> new PaymentItemDTO(i.getId(), i.getDescription(),
                        i.getQuantity(), i.getUnitPriceLkr(), i.getTotalLkr()))
                .collect(Collectors.toList());
        return new PaymentDetailDTO(
                p.getId(), p.getGymId(), p.getBranchId(), p.getMemberId(),
                name, phone, p.getPaymentNumber(), p.getPaymentType(),
                p.getAmountLkr(), p.getDiscountLkr(), p.getTaxLkr(), p.getFinalAmountLkr(),
                formatLkr(p.getFinalAmountLkr()), p.getMethod(), p.getStatus(),
                p.getReferenceNo(), p.getPayhereOrderId(), p.getDescription(), p.getNotes(),
                p.getPaidAt(), p.getDueDate(), p.getCreatedAt(),
                p.getInvoiceNumber(), p.getInvoiceUrl(),
                p.getRefundReason(), p.getRefundedAt(), p.getCreatedBy(), overdue, itemDTOs);
    }

    private String formatLkr(Long amount) {
        if (amount == null) return "LKR 0.00";
        return String.format("LKR %,.2f", amount / 100.0);
    }
}
