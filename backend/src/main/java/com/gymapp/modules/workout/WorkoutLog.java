package com.gymapp.modules.workout;

import com.gymapp.multitenancy.BaseEntity;
import com.gymapp.modules.workout.enums.WorkoutLogStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "workout_logs")
public class WorkoutLog extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "plan_id")
    private UUID planId;

    @Column(name = "day_id")
    private UUID dayId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkoutLogStatus status = WorkoutLogStatus.COMPLETED;

    @Column(name = "overall_feeling")
    private Integer overallFeeling;

    @Column(columnDefinition = "text")
    private String notes;

    @OneToMany(mappedBy = "workoutLog", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("setNumber ASC")
    private List<WorkoutSetLog> setLogs = new ArrayList<>();
}
