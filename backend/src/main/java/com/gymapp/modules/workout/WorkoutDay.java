package com.gymapp.modules.workout;

import com.gymapp.multitenancy.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "workout_days")
public class WorkoutDay extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private WorkoutPlan plan;

    @Column(name = "day_number", nullable = false)
    private int dayNumber;

    @Column(length = 50)
    private String name;

    @Column(length = 50)
    private String focus;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes = 60;

    @OneToMany(mappedBy = "day", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    private List<WorkoutExercise> exercises = new ArrayList<>();
}
