package com.gymapp.modules.workout;

import com.gymapp.multitenancy.TenantEntity;
import com.gymapp.modules.workout.enums.WorkoutGoal;
import com.gymapp.modules.workout.enums.WorkoutLevel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "workout_plans")
public class WorkoutPlan extends TenantEntity {

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkoutGoal goal = WorkoutGoal.GENERAL_FITNESS;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkoutLevel level = WorkoutLevel.BEGINNER;

    @Column(name = "days_per_week", nullable = false)
    private int daysPerWeek = 3;

    @Column(name = "duration_weeks", nullable = false)
    private int durationWeeks = 4;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes = 60;

    @Column(name = "is_template")
    private boolean template = false;

    @Column(name = "is_active")
    private boolean active = true;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "equipment_needed", columnDefinition = "text[]")
    private String[] equipmentNeeded;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("dayNumber ASC")
    private List<WorkoutDay> days = new ArrayList<>();
}
