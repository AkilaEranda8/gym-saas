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
@Table(name = "trainer_assignments")
public class TrainerAssignment extends TenantEntity {

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", length = 20)
    private AssignmentType assignmentType = AssignmentType.PERSONAL_TRAINING;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Column(name = "started_date", nullable = false)
    private LocalDate startedDate;

    @Column(name = "ended_date")
    private LocalDate endedDate;

    @Column(name = "sessions_total")
    private Integer sessionsTotal = 0;

    @Column(name = "sessions_used")
    private Integer sessionsUsed = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
