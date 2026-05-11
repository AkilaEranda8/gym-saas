package com.gymapp.contract;

import com.gymapp.AbstractIntegrationTest;
import com.gymapp.modules.billing.NewPaymentService;
import com.gymapp.modules.billing.DiscountService;
import com.gymapp.modules.billing.dto.BillingSummaryDTO;
import com.gymapp.modules.billing.dto.DiscountDTO;
import com.gymapp.modules.billing.dto.PaymentDTO;
import com.gymapp.multitenancy.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BillingApiContractTest extends AbstractIntegrationTest {

    @MockBean
    private NewPaymentService paymentService;

    @MockBean
    private DiscountService discountService;

    private static final UUID GYM_ID    = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    @BeforeEach
    void setup() {
        TenantContext.setGymId(GYM_ID);
        TenantContext.setBranchId(BRANCH_ID);
    }

    @Test
    void listPayments_responseShouldBePaginated() throws Exception {
        PaymentDTO dto = buildPaymentDTO();
        when(paymentService.listPayments(any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/v1/billing/payments?page=0&size=20")
                .header("Authorization", "Bearer " + OWNER_TOKEN))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.totalElements").isNumber());
    }

    @Test
    void listPayments_eachItemShouldHaveRequiredFields() throws Exception {
        PaymentDTO dto = buildPaymentDTO();
        when(paymentService.listPayments(any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(dto)));

        mockMvc.perform(get("/api/v1/billing/payments")
                .header("Authorization", "Bearer " + OWNER_TOKEN))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].id").exists())
            .andExpect(jsonPath("$.data.content[0].paymentNumber").exists())
            .andExpect(jsonPath("$.data.content[0].status").exists())
            .andExpect(jsonPath("$.data.content[0].amountLkr").isNumber())
            .andExpect(jsonPath("$.data.content[0].finalAmountLkr").isNumber());
    }

    @Test
    void billingSummary_responseShouldContainRevenueFields() throws Exception {
        BillingSummaryDTO summary = buildSummaryDTO();
        when(paymentService.getSummary(any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/v1/billing/payments/summary?from=2025-01-01&to=2025-12-31")
                .header("Authorization", "Bearer " + OWNER_TOKEN))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalRevenueLkr").isNumber())
            .andExpect(jsonPath("$.data.paidLkr").isNumber())
            .andExpect(jsonPath("$.data.pendingLkr").isNumber())
            .andExpect(jsonPath("$.data.refundedLkr").isNumber())
            .andExpect(jsonPath("$.data.totalTransactions").isNumber());
    }

    @Test
    void listDiscounts_responseShouldBeArray() throws Exception {
        when(discountService.list()).thenReturn(List.of(buildDiscountDTO()));

        mockMvc.perform(get("/api/v1/billing/discounts")
                .header("Authorization", "Bearer " + OWNER_TOKEN))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data").isArray())
            .andExpect(jsonPath("$.data[0].code").exists())
            .andExpect(jsonPath("$.data[0].discountType").exists())
            .andExpect(jsonPath("$.data[0].discountValue").isNumber());
    }

    @Test
    void billingEndpoints_unauthorizedReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/billing/payments"))
            .andExpect(status().isUnauthorized());
    }

    private PaymentDTO buildPaymentDTO() {
        return new PaymentDTO(
            UUID.randomUUID(), GYM_ID, UUID.randomUUID(), "Kamal Perera",
            "PAY250500001", "MEMBERSHIP", "CASH", "PAID",
            350000L, 0L, 350000L, "3,500.00",
            null, null, null, null, false,
            LocalDateTime.now(), LocalDateTime.now()
        );
    }

    private BillingSummaryDTO buildSummaryDTO() {
        return new BillingSummaryDTO(
            5_000_000L, 5_000_000L, 0L, 0L, 0L,
            10, 10, 0, 0, 0,
            500_000L, 4_500_000L,
            LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31)
        );
    }

    private DiscountDTO buildDiscountDTO() {
        return new DiscountDTO(
            UUID.randomUUID(), GYM_ID, "SAVE10", "10% off",
            "PERCENTAGE", 10.0, 100, 0, 100,
            LocalDate.now(), LocalDate.now().plusMonths(3),
            true, false
        );
    }
}
