package com.gymapp.modules.locker;

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
@Table(name = "locker_assignments")
public class LockerAssignment extends TenantEntity {

    @Column(name = "locker_id", nullable = false)
    private UUID lockerId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "monthly_rate", nullable = false, precision = 8, scale = 2)
    private BigDecimal monthlyRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Column(name = "payment_id")
    private UUID paymentId;

    public enum AssignmentStatus { ACTIVE, EXPIRED, RELEASED }
}
