package com.gymapp.modules.billing;

import com.gymapp.AbstractIntegrationTest;
import com.gymapp.TestDataFactory;
import com.gymapp.modules.billing.dto.*;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BillingApiIntegrationTest extends AbstractIntegrationTest {

    @MockBean NewPaymentService paymentService;
    @MockBean DiscountService   discountService;
    @MockBean InvoiceService    invoiceService;

    @BeforeEach
    void setTenant() {
        TenantContext.setGymId(TEST_GYM_ID);
    }

    // ── POST /api/v1/billing/payments ─────────────────────────────

    @Test
    void recordPayment_WithValidRequest_ShouldReturn201() throws Exception {
        RecordPaymentRequest req = TestDataFactory.cashPaymentRequest(TEST_MEMBER_ID.toString());
        PaymentDetailDTO resp    = buildPaymentDetailDTO(UUID.randomUUID());
        given(paymentService.recordPayment(any(), anyString())).willReturn(resp);

        mockMvc.perform(post("/api/v1/billing/payments")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("MANAGER"));
                        attrs.put("email", "admin@gym.lk");
                    }))
                .contentType(JSON)
                .content(toJson(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.status").value("PAID"));
    }

    @Test
    void recordPayment_UnauthorizedRole_ShouldReturn403() throws Exception {
        mockMvc.perform(post("/api/v1/billing/payments")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("MEMBER"));
                    }))
                .contentType(JSON)
                .content(toJson(TestDataFactory.cashPaymentRequest(TEST_MEMBER_ID.toString()))))
            .andExpect(status().isForbidden());
    }

    // ── GET /api/v1/billing/payments/{id} ─────────────────────────

    @Test
    void getPayment_WhenExists_ShouldReturn200() throws Exception {
        UUID paymentId  = UUID.randomUUID();
        PaymentDetailDTO resp = buildPaymentDetailDTO(paymentId);
        given(paymentService.getById(paymentId)).willReturn(resp);

        mockMvc.perform(get("/api/v1/billing/payments/{id}", paymentId)
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("MANAGER"));
                    })))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(paymentId.toString()))
            .andExpect(jsonPath("$.data.paymentType").value("MEMBERSHIP"));
    }

    @Test
    void getPayment_WhenNotFound_ShouldReturn404() throws Exception {
        given(paymentService.getById(any(UUID.class)))
            .willThrow(new NoSuchElementException("Payment not found"));

        mockMvc.perform(get("/api/v1/billing/payments/{id}", UUID.randomUUID())
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("MANAGER"));
                    })))
            .andExpect(status().isNotFound());
    }

    // ── POST /api/v1/billing/payments/{id}/refund ─────────────────

    @Test
    void refundPayment_WhenPaid_ShouldReturn200() throws Exception {
        UUID paymentId = UUID.randomUUID();
        PaymentDetailDTO refunded = buildPaymentDetailDTO(paymentId);
        given(paymentService.refundPayment(eq(paymentId), any())).willReturn(refunded);

        RefundPaymentRequest req = new RefundPaymentRequest("Customer request");

        mockMvc.perform(post("/api/v1/billing/payments/{id}/refund", paymentId)
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    }))
                .contentType(JSON)
                .content(toJson(req)))
            .andExpect(status().isOk());
    }

    @Test
    void refundPayment_WhenNotPaid_ShouldReturn409() throws Exception {
        UUID paymentId = UUID.randomUUID();
        given(paymentService.refundPayment(eq(paymentId), any()))
            .willThrow(new IllegalStateException("Only PAID payments can be refunded"));

        mockMvc.perform(post("/api/v1/billing/payments/{id}/refund", paymentId)
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    }))
                .contentType(JSON)
                .content(toJson(new RefundPaymentRequest("test"))))
            .andExpect(status().isConflict());
    }

    // ── GET /api/v1/billing/payments/summary ──────────────────────

    @Test
    void getSummary_WithValidDateRange_ShouldReturn200() throws Exception {
        BillingSummaryDTO summary = new BillingSummaryDTO(
            500000L, 500000L, 0L, 0L, 0L,
            10L, 10L, 0L, 0L, 0L,
            50000L, 450000L,
            LocalDate.now().minusDays(30), LocalDate.now()
        );
        given(paymentService.getSummary(any(), any())).willReturn(summary);

        mockMvc.perform(get("/api/v1/billing/payments/summary")
                .param("from", LocalDate.now().minusDays(30).toString())
                .param("to", LocalDate.now().toString())
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("MANAGER"));
                    })))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalRevenueLkr").value(500000));
    }

    // ── POST /api/v1/billing/discounts ────────────────────────────

    @Test
    void createDiscount_WithValidRequest_ShouldReturn201() throws Exception {
        CreateDiscountRequest req = TestDataFactory.percentageDiscountRequest("TEST10");
        DiscountDTO dto = new DiscountDTO(
            UUID.randomUUID(), TEST_GYM_ID, "TEST10", "10% off",
            DiscountType.PERCENTAGE, 10L, 100, 0, 100,
            LocalDate.now(), LocalDate.now().plusDays(30), true, false
        );
        given(discountService.create(any())).willReturn(dto);

        mockMvc.perform(post("/api/v1/billing/discounts")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("MANAGER"));
                    }))
                .contentType(JSON)
                .content(toJson(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.code").value("TEST10"));
    }

    // ── Helpers ───────────────────────────────────────────────────

    private PaymentDetailDTO buildPaymentDetailDTO(UUID id) {
        return new PaymentDetailDTO(
            id, TEST_GYM_ID, null, TEST_MEMBER_ID, "Kamal Perera",
            "PAY2505" + String.format("%05d", 1),
            PaymentType.MEMBERSHIP, 350000L, 0L, 0L, 350000L,
            PaymentMethod.CASH, PaymentStatus.PAID,
            null, null, null, null, null,
            null, null, null, null, null, List.of()
        );
    }
}
