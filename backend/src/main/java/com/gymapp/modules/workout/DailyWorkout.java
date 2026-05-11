package com.gymapp.modules.workout;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "daily_workouts",
       uniqueConstraints = @UniqueConstraint(columnNames = {"gym_id", "workout_date"}))
public class DailyWorkout extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "workout_date", nullable = false)
    private LocalDate workoutDate;

    @Column(length = 20)
    private String difficulty;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(columnDefinition = "text")
    private String exercises = "[]";

    @Column(columnDefinition = "text")
    private String notes;
}
