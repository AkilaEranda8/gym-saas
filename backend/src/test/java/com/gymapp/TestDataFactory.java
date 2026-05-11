package com.gymapp;

import com.gymapp.modules.billing.*;
import com.gymapp.modules.billing.dto.*;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.dto.MemberRequest;
import com.gymapp.shared.enums.MemberStatus;
import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Centralized factory for building test fixtures used across integration tests.
 */
public final class TestDataFactory {

    private TestDataFactory() {}

    public static final UUID GYM_ID    = UUID.fromString("00000000-0000-0000-0000-000000000001");
    public static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");
    public static final UUID MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000003");

    // ── Member ─────────────────────────────────────────────────────

    public static Member activeMember() {
        Member m = new Member();
        m.setId(MEMBER_ID);
        m.setGymId(GYM_ID);
        m.setFirstName("Kamal");
        m.setLastName("Perera");
        m.setEmail("kamal@test.lk");
        m.setPhone("0771234567");
        m.setStatus(MemberStatus.ACTIVE);
        m.setJoinDate(LocalDate.now().minusMonths(6));
        m.setExpiryDate(LocalDate.now().plusMonths(1));
        return m;
    }

    public static Member expiredMember() {
        Member m = activeMember();
        m.setId(UUID.randomUUID());
        m.setEmail("expired@test.lk");
        m.setPhone("0770000001");
        m.setStatus(MemberStatus.EXPIRED);
        m.setExpiryDate(LocalDate.now().minusDays(5));
        return m;
    }

    public static MemberRequest createMemberRequest() {
        return new MemberRequest(
            "Test", "User", "testuser" + System.nanoTime() + "@test.lk",
            "077" + (int)(Math.random() * 9000000 + 1000000),
            LocalDate.of(1995, 6, 15),
            null, null, null, null, null, null
        );
    }

    // ── Payment ────────────────────────────────────────────────────

    public static Payment paidPayment(UUID memberId) {
        Payment p = new Payment();
        p.setId(UUID.randomUUID());
        p.setGymId(GYM_ID);
        p.setMemberId(memberId);
        p.setPaymentNumber("PAY2505" + String.format("%05d", (int)(Math.random() * 99999)));
        p.setPaymentType(PaymentType.MEMBERSHIP);
        p.setAmountLkr(350000L);
        p.setDiscountLkr(0L);
        p.setFinalAmountLkr(350000L);
        p.setMethod(PaymentMethod.CASH);
        p.setStatus(PaymentStatus.PAID);
        return p;
    }

    public static RecordPaymentRequest cashPaymentRequest(String memberId) {
        return new RecordPaymentRequest(
            memberId, PaymentType.MEMBERSHIP, 350000L,
            null, PaymentMethod.CASH, null, "Monthly membership", null,
            LocalDate.now().plusMonths(1), null, true
        );
    }

    // ── Discount ───────────────────────────────────────────────────

    public static CreateDiscountRequest percentageDiscountRequest(String code) {
        return new CreateDiscountRequest(
            code, "Test percentage discount", DiscountType.PERCENTAGE, 10L,
            100, LocalDate.now(), LocalDate.now().plusDays(30)
        );
    }

    public static CreateDiscountRequest fixedDiscountRequest(String code) {
        return new CreateDiscountRequest(
            code, "Test fixed discount", DiscountType.FIXED, 50000L,
            null, LocalDate.now(), null
        );
    }
}
