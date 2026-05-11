package com.gymapp.modules.locker;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "lockers")
public class Locker extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "locker_number", nullable = false, length = 20)
    private String lockerNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LockerSize size = LockerSize.MEDIUM;

    @Column(name = "monthly_rate", nullable = false, precision = 8, scale = 2)
    private BigDecimal monthlyRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LockerStatus status = LockerStatus.AVAILABLE;

    public enum LockerSize    { SMALL, MEDIUM, LARGE }
    public enum LockerStatus  { AVAILABLE, OCCUPIED, MAINTENANCE }
}
