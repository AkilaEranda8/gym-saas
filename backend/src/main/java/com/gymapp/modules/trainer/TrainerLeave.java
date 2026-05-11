package com.gymapp.modules.trainer;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "trainer_leave")
public class TrainerLeave extends TenantEntity {

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "leave_type", length = 20, nullable = false)
    private LeaveType leaveType;

    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date", nullable = false)
    private LocalDate toDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private LeaveStatus status = LeaveStatus.PENDING;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;
}
