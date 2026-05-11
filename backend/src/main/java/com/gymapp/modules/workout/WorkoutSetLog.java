package com.gymapp.modules.workout;

import com.gymapp.multitenancy.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "workout_set_logs")
public class WorkoutSetLog extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_log_id", nullable = false)
    private WorkoutLog workoutLog;

    @Column(name = "workout_exercise_id", nullable = false)
    private UUID workoutExerciseId;

    @Column(name = "exercise_id", nullable = false)
    private UUID exerciseId;

    @Column(name = "set_number", nullable = false)
    private int setNumber;

    @Column(name = "reps_completed")
    private Integer repsCompleted;

    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "rpe_actual")
    private Integer rpeActual;

    @Column(columnDefinition = "text")
    private String notes;
}
