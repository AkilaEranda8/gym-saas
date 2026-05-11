package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.*;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.*;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class NewPaymentServiceTest {

    @Mock PaymentRepository  paymentRepo;
    @Mock MemberRepository   memberRepo;
    @Mock DiscountRepository discountRepo;
    @Mock InvoiceService     invoiceService;
    @Mock RabbitTemplate     rabbitTemplate;

    @InjectMocks NewPaymentService paymentService;

    static final UUID GYM_ID    = UUID.randomUUID();
    static final UUID MEMBER_ID = UUID.randomUUID();
    static final UUID PAYMENT_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setGymId(GYM_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── recordPayment ─────────────────────────────────────────────

    @Test
    void recordPayment_WhenCashMethod_ShouldSetStatusPaidAndPaidAt() {
        Member member = buildMember();
        RecordPaymentRequest req = new RecordPaymentRequest(
            MEMBER_ID.toString(), PaymentType.MEMBERSHIP, 350000L,
            null, PaymentMethod.CASH, null, "Monthly fee", null, null, null, false
        );

        Payment savedPayment = buildPayment(PaymentStatus.PAID);
        given(memberRepo.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(member));
        given(paymentRepo.findMaxSequenceByGymId(GYM_ID)).willReturn(null);
        given(paymentRepo.save(any(Payment.class))).willReturn(savedPayment);
        doNothing().when(invoiceService).generateForPayment(any(), any());

        PaymentDetailDTO result = paymentService.recordPayment(req, "admin@gym.lk");

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(PaymentStatus.PAID);
        verify(paymentRepo).save(any(Payment.class));
    }

    @Test
    void recordPayment_WhenPayhereMethod_ShouldSetStatusPending() {
        Member member = buildMember();
        RecordPaymentRequest req = new RecordPaymentRequest(
            MEMBER_ID.toString(), PaymentType.MEMBERSHIP, 350000L,
            null, PaymentMethod.PAYHERE, null, "Monthly fee", null, null, null, false
        );

        Payment savedPayment = buildPayment(PaymentStatus.PENDING);
        given(memberRepo.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(member));
        given(paymentRepo.findMaxSequenceByGymId(GYM_ID)).willReturn(42);
        given(paymentRepo.save(any(Payment.class))).willReturn(savedPayment);

        PaymentDetailDTO result = paymentService.recordPayment(req, "admin@gym.lk");

        assertThat(result.status()).isEqualTo(PaymentStatus.PENDING);
        verify(invoiceService, never()).generateForPayment(any(), any());
    }

    @Test
    void recordPayment_WhenMemberNotFound_ShouldThrowNoSuchElementException() {
        given(memberRepo.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.empty());
        RecordPaymentRequest req = new RecordPaymentRequest(
            MEMBER_ID.toString(), PaymentType.MEMBERSHIP, 350000L,
            null, PaymentMethod.CASH, null, null, null, null, null, false
        );

        assertThatThrownBy(() -> paymentService.recordPayment(req, "admin"))
            .isInstanceOf(NoSuchElementException.class)
            .hasMessageContaining("Member not found");
    }

    @Test
    void recordPayment_WithValidDiscountCode_ShouldApplyDiscountToFinalAmount() {
        Member member = buildMember();
        Discount discount = buildDiscount(DiscountType.PERCENTAGE, 10L);

        RecordPaymentRequest req = new RecordPaymentRequest(
            MEMBER_ID.toString(), PaymentType.MEMBERSHIP, 100000L,
            "SAVE10", PaymentMethod.CASH, null, null, null, null, null, false
        );

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        Payment savedPayment = buildPayment(PaymentStatus.PAID);
        given(memberRepo.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(member));
        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "SAVE10")).willReturn(Optional.of(discount));
        given(paymentRepo.findMaxSequenceByGymId(GYM_ID)).willReturn(0);
        given(paymentRepo.save(paymentCaptor.capture())).willReturn(savedPayment);
        doNothing().when(invoiceService).generateForPayment(any(), any());

        paymentService.recordPayment(req, "admin");

        Payment captured = paymentCaptor.getValue();
        assertThat(captured.getDiscountLkr()).isEqualTo(10000L);
        assertThat(captured.getFinalAmountLkr()).isEqualTo(90000L);
    }

    @Test
    void recordPayment_WithExpiredDiscountCode_ShouldNotApplyDiscount() {
        Member member = buildMember();
        Discount expiredDiscount = buildDiscount(DiscountType.PERCENTAGE, 10L);
        expiredDiscount.setValidUntil(LocalDate.now().minusDays(1));

        RecordPaymentRequest req = new RecordPaymentRequest(
            MEMBER_ID.toString(), PaymentType.MEMBERSHIP, 100000L,
            "OLD10", PaymentMethod.CASH, null, null, null, null, null, false
        );

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        Payment savedPayment = buildPayment(PaymentStatus.PAID);
        given(memberRepo.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(member));
        given(discountRepo.findByGymIdAndCodeAndIsActiveTrue(GYM_ID, "OLD10")).willReturn(Optional.of(expiredDiscount));
        given(paymentRepo.findMaxSequenceByGymId(GYM_ID)).willReturn(0);
        given(paymentRepo.save(captor.capture())).willReturn(savedPayment);
        doNothing().when(invoiceService).generateForPayment(any(), any());

        paymentService.recordPayment(req, "admin");

        Payment captured = captor.getValue();
        assertThat(captured.getDiscountLkr()).isEqualTo(0L);
        assertThat(captured.getFinalAmountLkr()).isEqualTo(100000L);
    }

    // ── refundPayment ─────────────────────────────────────────────

    @Test
    void refundPayment_WhenStatusPaid_ShouldSetRefundedStatusAndTimestamp() {
        Payment paidPayment = buildPayment(PaymentStatus.PAID);
        paidPayment.setMemberId(MEMBER_ID);

        given(paymentRepo.findByIdAndGymId(PAYMENT_ID, GYM_ID)).willReturn(Optional.of(paidPayment));
        given(paymentRepo.save(any(Payment.class))).willReturn(paidPayment);
        given(memberRepo.findById(MEMBER_ID)).willReturn(Optional.of(buildMember()));

        RefundPaymentRequest refundReq = new RefundPaymentRequest("Customer request");
        PaymentDetailDTO result = paymentService.refundPayment(PAYMENT_ID, refundReq);

        assertThat(paidPayment.getStatus()).isEqualTo(PaymentStatus.REFUNDED);
        assertThat(paidPayment.getRefundReason()).isEqualTo("Customer request");
        assertThat(paidPayment.getRefundedAt()).isNotNull();
    }

    @Test
    void refundPayment_WhenStatusNotPaid_ShouldThrowIllegalStateException() {
        Payment pendingPayment = buildPayment(PaymentStatus.PENDING);
        given(paymentRepo.findByIdAndGymId(PAYMENT_ID, GYM_ID)).willReturn(Optional.of(pendingPayment));

        assertThatThrownBy(() -> paymentService.refundPayment(PAYMENT_ID, new RefundPaymentRequest("test")))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Only PAID payments can be refunded");
    }

    // ── updateStatus ──────────────────────────────────────────────

    @Test
    void updateStatus_WhenSettingPaid_ShouldSetPaidAt() {
        Payment payment = buildPayment(PaymentStatus.PENDING);
        payment.setMemberId(MEMBER_ID);

        given(paymentRepo.findByIdAndGymId(PAYMENT_ID, GYM_ID)).willReturn(Optional.of(payment));
        given(paymentRepo.save(any())).willReturn(payment);
        given(memberRepo.findById(MEMBER_ID)).willReturn(Optional.of(buildMember()));

        UpdatePaymentStatusRequest req = new UpdatePaymentStatusRequest(PaymentStatus.PAID, "REF123", null);
        paymentService.updateStatus(PAYMENT_ID, req);

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(payment.getPaidAt()).isNotNull();
        assertThat(payment.getReferenceNo()).isEqualTo("REF123");
    }

    // ── getSummary ────────────────────────────────────────────────

    @Test
    void getSummary_ShouldAggregateCountsAndRevenue() {
        given(paymentRepo.sumByGymIdAndStatusPaidAndPaidAtBetween(eq(GYM_ID), any(), any())).willReturn(500000L);
        given(paymentRepo.countByGymIdAndStatus(GYM_ID, PaymentStatus.PAID)).willReturn(10L);
        given(paymentRepo.countByGymIdAndStatus(GYM_ID, PaymentStatus.PENDING)).willReturn(3L);
        given(paymentRepo.countByGymIdAndStatus(GYM_ID, PaymentStatus.FAILED)).willReturn(1L);
        given(paymentRepo.countByGymIdAndStatus(GYM_ID, PaymentStatus.REFUNDED)).willReturn(0L);

        BillingSummaryDTO summary = paymentService.getSummary(LocalDate.now().minusDays(30), LocalDate.now());

        assertThat(summary.totalRevenueLkr()).isEqualTo(500000L);
        assertThat(summary.totalTransactions()).isEqualTo(14L);
        assertThat(summary.paidCount()).isEqualTo(10L);
        assertThat(summary.pendingCount()).isEqualTo(3L);
    }

    // ── listPayments ──────────────────────────────────────────────

    @Test
    void listPayments_ShouldDelegateToRepository() {
        Page<Payment> emptyPage = new PageImpl<>(List.of());
        given(paymentRepo.findAllWithFilters(any(), any(), any(), any(), any(), any(), any(), any()))
            .willReturn(emptyPage);

        Page<PaymentDTO> result = paymentService.listPayments(
            null, null, null, null, null, null, PageRequest.of(0, 20)
        );

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(0);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Member buildMember() {
        Member m = new Member();
        m.setId(MEMBER_ID);
        m.setGymId(GYM_ID);
        m.setFirstName("Kamal");
        m.setLastName("Perera");
        m.setEmail("kamal@test.lk");
        m.setPhone("0771234567");
        return m;
    }

    private Payment buildPayment(PaymentStatus status) {
        Payment p = new Payment();
        p.setId(PAYMENT_ID);
        p.setGymId(GYM_ID);
        p.setMemberId(MEMBER_ID);
        p.setPaymentNumber("PAY2505" + "00001");
        p.setPaymentType(PaymentType.MEMBERSHIP);
        p.setAmountLkr(350000L);
        p.setDiscountLkr(0L);
        p.setFinalAmountLkr(350000L);
        p.setMethod(PaymentMethod.CASH);
        p.setStatus(status);
        return p;
    }

    private Discount buildDiscount(DiscountType type, long value) {
        Discount d = new Discount();
        d.setId(UUID.randomUUID());
        d.setGymId(GYM_ID);
        d.setCode("SAVE10");
        d.setDiscountType(type);
        d.setDiscountValue(value);
        d.setIsActive(true);
        d.setValidFrom(LocalDate.now().minusDays(30));
        d.setValidUntil(LocalDate.now().plusDays(30));
        d.setUsedCount(0);
        return d;
    }
}
