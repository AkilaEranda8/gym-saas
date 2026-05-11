package com.gymapp.modules.billing;

import com.gymapp.config.PayhereProperties;
import com.gymapp.modules.billing.dto.*;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;
import org.apache.commons.codec.digest.DigestUtils;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class PayhereServiceTest {

    @Mock PayhereProperties              config;
    @Mock PaymentRepository              paymentRepo;
    @Mock PayhereTransactionRepository   txnRepo;
    @Mock MemberRepository               memberRepo;
    @Mock InvoiceService                 invoiceService;

    @InjectMocks PayhereService payhereService;

    static final UUID GYM_ID    = UUID.randomUUID();
    static final UUID MEMBER_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setGymId(GYM_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── initiatePayment ───────────────────────────────────────────

    @Test
    void initiatePayment_WhenValidMember_ShouldReturnPayhereInitDTO() {
        Member member = buildMember();
        InitiatePayhereRequest req = new InitiatePayhereRequest(
            MEMBER_ID.toString(), 350000L, PaymentType.MEMBERSHIP, "Monthly membership"
        );

        given(memberRepo.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(member));
        given(config.getMerchantId()).willReturn("TEST_MERCHANT");
        given(config.getMerchantSecret()).willReturn("TEST_SECRET");
        given(config.isSandbox()).willReturn(true);
        given(config.getSandboxUrl()).willReturn("https://sandbox.payhere.lk/pay/checkout");
        given(config.getReturnUrl()).willReturn("http://localhost:3000/billing");
        given(config.getCancelUrl()).willReturn("http://localhost:3000/billing");
        given(config.getNotifyUrl()).willReturn("http://localhost:9090/api/v1/billing/payhere/notify");

        PayhereInitDTO result = payhereService.initiatePayment(req);

        assertThat(result).isNotNull();
        assertThat(result.merchant_id()).isEqualTo("TEST_MERCHANT");
        assertThat(result.amount()).isEqualTo("3500.00");
        assertThat(result.currency()).isEqualTo("LKR");
        assertThat(result.first_name()).isEqualTo("Kamal");
        assertThat(result.email()).isEqualTo("kamal@test.lk");
        assertThat(result.checkoutUrl()).isEqualTo("https://sandbox.payhere.lk/pay/checkout");
        assertThat(result.hash()).isNotBlank();
    }

    @Test
    void initiatePayment_WhenMemberNotFound_ShouldThrow() {
        given(memberRepo.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.empty());
        InitiatePayhereRequest req = new InitiatePayhereRequest(
            MEMBER_ID.toString(), 350000L, PaymentType.MEMBERSHIP, null
        );

        assertThatThrownBy(() -> payhereService.initiatePayment(req))
            .isInstanceOf(NoSuchElementException.class)
            .hasMessageContaining("Member not found");
    }

    // ── handleNotification ────────────────────────────────────────

    @Test
    void handleNotification_WhenStatusCode2_ShouldMarkPaymentPaid() {
        String orderId = "ORD-" + GYM_ID.toString().substring(0, 8).toUpperCase() + "-" + System.currentTimeMillis();
        Payment payment = buildPayment(orderId);
        PayhereNotifyRequest notify = buildNotifyRequest(orderId, 2, "Success");

        String secret = "TEST_SECRET";
        String md5Secret = DigestUtils.md5Hex(secret).toUpperCase();
        String expectedSig = DigestUtils.md5Hex(
            "TEST_MERCHANT" + orderId + "3500.00" + "LKR" + 2 + md5Secret
        ).toUpperCase();
        notify.setMd5sig(expectedSig);

        given(config.getMerchantSecret()).willReturn(secret);
        given(config.getMerchantId()).willReturn("TEST_MERCHANT");
        given(txnRepo.findByOrderId(orderId)).willReturn(Optional.empty());
        given(paymentRepo.findByPayhereOrderId(orderId)).willReturn(Optional.of(payment));
        given(paymentRepo.save(any())).willReturn(payment);
        given(txnRepo.save(any())).willAnswer(inv -> inv.getArgument(0));
        given(memberRepo.findById(MEMBER_ID)).willReturn(Optional.of(buildMember()));
        doNothing().when(invoiceService).generateForPayment(any(), any());

        payhereService.handleNotification(notify);

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(payment.getPaidAt()).isNotNull();
        verify(invoiceService).generateForPayment(any(), any());
    }

    @Test
    void handleNotification_WhenStatusCodeMinus1_ShouldMarkPaymentFailed() {
        String orderId = "ORD-TEST-ORDER";
        Payment payment = buildPayment(orderId);
        PayhereNotifyRequest notify = buildNotifyRequest(orderId, -1, "Failed");

        given(config.getMerchantSecret()).willReturn("");
        given(txnRepo.findByOrderId(orderId)).willReturn(Optional.empty());
        given(paymentRepo.findByPayhereOrderId(orderId)).willReturn(Optional.of(payment));
        given(paymentRepo.save(any())).willReturn(payment);
        given(txnRepo.save(any())).willAnswer(inv -> inv.getArgument(0));

        payhereService.handleNotification(notify);

        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.FAILED);
        verify(invoiceService, never()).generateForPayment(any(), any());
    }

    @Test
    void handleNotification_WhenSignatureMismatch_ShouldThrowIllegalArgumentException() {
        String orderId = "ORD-TEST";
        PayhereNotifyRequest notify = buildNotifyRequest(orderId, 2, "Success");
        notify.setMd5sig("INVALID_SIGNATURE");

        given(config.getMerchantSecret()).willReturn("REAL_SECRET");
        given(config.getMerchantId()).willReturn("TEST_MERCHANT");

        assertThatThrownBy(() -> payhereService.handleNotification(notify))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Invalid PayHere signature");
    }

    @Test
    void handleNotification_WhenPaymentNotFound_ShouldSaveTransactionOnly() {
        String orderId = "ORD-UNKNOWN";
        PayhereNotifyRequest notify = buildNotifyRequest(orderId, 2, "Success");

        given(config.getMerchantSecret()).willReturn("");
        given(txnRepo.findByOrderId(orderId)).willReturn(Optional.empty());
        given(paymentRepo.findByPayhereOrderId(orderId)).willReturn(Optional.empty());
        given(txnRepo.save(any())).willAnswer(inv -> inv.getArgument(0));

        payhereService.handleNotification(notify);

        verify(paymentRepo, never()).save(any());
        verify(txnRepo).save(any());
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
        m.setAddress("Colombo");
        return m;
    }

    private Payment buildPayment(String orderId) {
        Payment p = new Payment();
        p.setId(UUID.randomUUID());
        p.setGymId(GYM_ID);
        p.setMemberId(MEMBER_ID);
        p.setPayhereOrderId(orderId);
        p.setAmountLkr(350000L);
        p.setFinalAmountLkr(350000L);
        p.setDiscountLkr(0L);
        p.setMethod(PaymentMethod.PAYHERE);
        p.setStatus(PaymentStatus.PENDING);
        p.setPaymentType(PaymentType.MEMBERSHIP);
        p.setPaymentNumber("PAY250500001");
        return p;
    }

    private PayhereNotifyRequest buildNotifyRequest(String orderId, int statusCode, String statusMsg) {
        PayhereNotifyRequest n = new PayhereNotifyRequest();
        n.setMerchantId("TEST_MERCHANT");
        n.setOrderId(orderId);
        n.setPayhereAmount("3500.00");
        n.setPayhereCurrency("LKR");
        n.setStatusCode(statusCode);
        n.setStatusMessage(statusMsg);
        n.setMethod("Visa");
        return n;
    }
}
