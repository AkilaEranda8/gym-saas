package com.gymapp.modules.workout;

import com.gymapp.multitenancy.BaseEntity;
import com.gymapp.modules.workout.enums.AssignmentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "member_workout_assignments")
public class MemberWorkoutAssignment extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private WorkoutPlan plan;

    @Column(name = "assigned_by", length = 100)
    private String assignedBy;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Column(name = "current_week")
    private Integer currentWeek = 1;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
