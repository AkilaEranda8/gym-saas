package com.gymapp.modules.workout;

import com.gymapp.multitenancy.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "workout_exercises")
public class WorkoutExercise extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    private WorkoutDay day;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "order_index")
    private int orderIndex = 0;

    private Integer sets;

    @Column(length = 20)
    private String reps;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "rest_seconds")
    private Integer restSeconds = 60;

    @Column(name = "weight_note", length = 50)
    private String weightNote;

    @Column(length = 20)
    private String tempo;

    private Integer rpe;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "is_superset")
    private boolean superset = false;

    @Column(name = "superset_group")
    private Integer supersetGroup;
}
