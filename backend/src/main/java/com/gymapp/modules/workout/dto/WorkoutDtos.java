package com.gymapp.modules.workout.dto;

import com.gymapp.modules.workout.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public final class WorkoutDtos {

    private WorkoutDtos() {}

    // ── Request DTOs ─────────────────────────────────────────

    public record WorkoutExerciseRequest(
        @NotNull UUID exerciseId,
        @NotNull @Min(0) Integer orderIndex,
        Integer sets,
        String reps,
        Integer durationSeconds,
        Integer restSeconds,
        String weightNote,
        String tempo,
        @Min(1) @Max(10) Integer rpe,
        String notes,
        boolean superset,
        Integer supersetGroup
    ) {}

    public record WorkoutDayRequest(
        @NotNull @Min(1) @Max(7) Integer dayNumber,
        @Size(max = 50) String name,
        @Size(max = 50) String focus,
        String notes,
        Integer estimatedMinutes,
        @Valid List<WorkoutExerciseRequest> exercises
    ) {}

    public record CreateWorkoutPlanRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        @NotNull WorkoutGoal goal,
        @NotNull WorkoutLevel level,
        @NotNull @Min(1) @Max(7) Integer daysPerWeek,
        @NotNull @Min(1) Integer durationWeeks,
        Integer durationMinutes,
        boolean template,
        String[] tags,
        String[] equipmentNeeded,
        String notes,
        @Valid List<WorkoutDayRequest> days
    ) {}

    public record UpdateWorkoutPlanRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        @NotNull WorkoutGoal goal,
        @NotNull WorkoutLevel level,
        @NotNull @Min(1) @Max(7) Integer daysPerWeek,
        @NotNull @Min(1) Integer durationWeeks,
        Integer durationMinutes,
        String[] tags,
        String[] equipmentNeeded,
        String notes,
        @Valid List<WorkoutDayRequest> days
    ) {}

    public record AssignWorkoutRequest(
        @NotNull UUID memberId,
        @NotNull UUID planId,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        String notes
    ) {}

    public record UpdateAssignmentStatusRequest(
        @NotNull AssignmentStatus status
    ) {}

    public record WorkoutSetLogRequest(
        @NotNull UUID workoutExerciseId,
        @NotNull UUID exerciseId,
        @NotNull @Min(1) Integer setNumber,
        Integer repsCompleted,
        BigDecimal weightKg,
        Integer durationSeconds,
        @Min(1) @Max(10) Integer rpeActual,
        String notes
    ) {}

    public record CreateWorkoutLogRequest(
        UUID assignmentId,
        UUID planId,
        UUID dayId,
        @NotNull LocalDate logDate,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        Integer durationMinutes,
        @NotNull WorkoutLogStatus status,
        @Min(1) @Max(5) Integer overallFeeling,
        String notes,
        @Valid List<WorkoutSetLogRequest> setLogs
    ) {}

    public record CreateExerciseRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        @NotNull ExerciseCategory category,
        String[] muscleGroups,
        ExerciseEquipment equipment,
        WorkoutLevel difficulty,
        String instructions,
        String tips,
        String videoUrl,
        String imageUrl
    ) {}

    public record CreatePersonalRecordRequest(
        @NotNull UUID exerciseId,
        @NotNull PersonalRecordType recordType,
        @NotNull BigDecimal value,
        String unit,
        @NotNull LocalDate achievedDate,
        String notes
    ) {}

    // ── Response DTOs ─────────────────────────────────────────

    public record ExerciseResponse(
        UUID id,
        UUID gymId,
        String name,
        String description,
        ExerciseCategory category,
        String[] muscleGroups,
        ExerciseEquipment equipment,
        WorkoutLevel difficulty,
        String instructions,
        String tips,
        String videoUrl,
        String imageUrl,
        boolean custom,
        LocalDateTime createdAt
    ) {}

    public record WorkoutExerciseResponse(
        UUID id,
        UUID exerciseId,
        String exerciseName,
        ExerciseCategory exerciseCategory,
        ExerciseEquipment exerciseEquipment,
        int orderIndex,
        Integer sets,
        String reps,
        Integer durationSeconds,
        Integer restSeconds,
        String weightNote,
        String tempo,
        Integer rpe,
        String notes,
        boolean superset,
        Integer supersetGroup
    ) {}

    public record WorkoutDayResponse(
        UUID id,
        int dayNumber,
        String name,
        String focus,
        String notes,
        Integer estimatedMinutes,
        List<WorkoutExerciseResponse> exercises
    ) {}

    public record WorkoutPlanResponse(
        UUID id,
        UUID gymId,
        String name,
        String description,
        WorkoutGoal goal,
        WorkoutLevel level,
        int daysPerWeek,
        int durationWeeks,
        int durationMinutes,
        boolean template,
        boolean active,
        String[] tags,
        String[] equipmentNeeded,
        String notes,
        String createdBy,
        LocalDateTime createdAt,
        int dayCount
    ) {}

    public record WorkoutPlanDetailResponse(
        UUID id,
        UUID gymId,
        String name,
        String description,
        WorkoutGoal goal,
        WorkoutLevel level,
        int daysPerWeek,
        int durationWeeks,
        int durationMinutes,
        boolean template,
        boolean active,
        String[] tags,
        String[] equipmentNeeded,
        String notes,
        String createdBy,
        LocalDateTime createdAt,
        List<WorkoutDayResponse> days
    ) {}

    public record AssignmentResponse(
        UUID id,
        UUID memberId,
        UUID planId,
        String planName,
        WorkoutGoal planGoal,
        WorkoutLevel planLevel,
        String assignedBy,
        LocalDate startDate,
        LocalDate endDate,
        AssignmentStatus status,
        Integer currentWeek,
        String notes,
        LocalDateTime createdAt
    ) {}

    public record WorkoutSetLogResponse(
        UUID id,
        UUID workoutExerciseId,
        UUID exerciseId,
        String exerciseName,
        int setNumber,
        Integer repsCompleted,
        BigDecimal weightKg,
        Integer durationSeconds,
        Integer rpeActual,
        String notes
    ) {}

    public record WorkoutLogResponse(
        UUID id,
        UUID memberId,
        UUID assignmentId,
        UUID planId,
        String planName,
        UUID dayId,
        String dayName,
        LocalDate logDate,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        Integer durationMinutes,
        WorkoutLogStatus status,
        Integer overallFeeling,
        String notes,
        LocalDateTime createdAt,
        List<WorkoutSetLogResponse> setLogs
    ) {}

    public record PersonalRecordResponse(
        UUID id,
        UUID memberId,
        UUID exerciseId,
        String exerciseName,
        ExerciseCategory exerciseCategory,
        PersonalRecordType recordType,
        BigDecimal value,
        String unit,
        LocalDate achievedDate,
        String notes,
        LocalDateTime createdAt
    ) {}

    public record WorkoutStatsResponse(
        long totalPlans,
        long activeAssignments,
        long totalSessionsThisMonth,
        long totalMinutesThisMonth,
        long totalPRs
    ) {}
}
