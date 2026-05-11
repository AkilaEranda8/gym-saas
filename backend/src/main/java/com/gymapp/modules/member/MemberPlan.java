package com.gymapp.modules.member;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "member_plans")
public class MemberPlan extends TenantEntity {

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "plan_id", nullable = false)
    private UUID planId;

    @Column(name = "plan_name", nullable = false, length = 100)
    private String planName;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberPlanStatus status = MemberPlanStatus.ACTIVE;

    @Column(name = "payment_id")
    private UUID paymentId;

    @Column(name = "freeze_start")
    private LocalDate freezeStart;

    @Column(name = "freeze_end")
    private LocalDate freezeEnd;

    public enum MemberPlanStatus {
        ACTIVE, EXPIRED, CANCELLED, FROZEN
    }
}
