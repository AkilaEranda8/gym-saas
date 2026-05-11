package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WorkoutMapper {

    public ExerciseResponse toExerciseResponse(Exercise e) {
        return new ExerciseResponse(
            e.getId(), e.getGymId(), e.getName(), e.getDescription(),
            e.getCategory(), e.getMuscleGroups(), e.getEquipment(), e.getDifficulty(),
            e.getInstructions(), e.getTips(), e.getVideoUrl(), e.getImageUrl(),
            e.isCustom(), e.getCreatedAt()
        );
    }

    public WorkoutExerciseResponse toWeResponse(WorkoutExercise we) {
        Exercise ex = we.getExercise();
        return new WorkoutExerciseResponse(
            we.getId(),
            ex.getId(), ex.getName(), ex.getCategory(), ex.getEquipment(),
            we.getOrderIndex(), we.getSets(), we.getReps(),
            we.getDurationSeconds(), we.getRestSeconds(),
            we.getWeightNote(), we.getTempo(), we.getRpe(), we.getNotes(),
            we.isSuperset(), we.getSupersetGroup()
        );
    }

    public WorkoutDayResponse toDayResponse(WorkoutDay d) {
        List<WorkoutExerciseResponse> exs = d.getExercises() == null
            ? List.of()
            : d.getExercises().stream().map(this::toWeResponse).toList();
        return new WorkoutDayResponse(
            d.getId(), d.getDayNumber(), d.getName(), d.getFocus(),
            d.getNotes(), d.getEstimatedMinutes(), exs
        );
    }

    public WorkoutPlanResponse toPlanResponse(WorkoutPlan p) {
        return new WorkoutPlanResponse(
            p.getId(), p.getGymId(), p.getName(), p.getDescription(),
            p.getGoal(), p.getLevel(), p.getDaysPerWeek(), p.getDurationWeeks(),
            p.getDurationMinutes(), p.isTemplate(), p.isActive(),
            p.getTags(), p.getEquipmentNeeded(), p.getNotes(), p.getCreatedBy(),
            p.getCreatedAt(),
            p.getDays() == null ? 0 : p.getDays().size()
        );
    }

    public WorkoutPlanDetailResponse toPlanDetailResponse(WorkoutPlan p) {
        List<WorkoutDayResponse> days = p.getDays() == null
            ? List.of()
            : p.getDays().stream().map(this::toDayResponse).toList();
        return new WorkoutPlanDetailResponse(
            p.getId(), p.getGymId(), p.getName(), p.getDescription(),
            p.getGoal(), p.getLevel(), p.getDaysPerWeek(), p.getDurationWeeks(),
            p.getDurationMinutes(), p.isTemplate(), p.isActive(),
            p.getTags(), p.getEquipmentNeeded(), p.getNotes(), p.getCreatedBy(),
            p.getCreatedAt(), days
        );
    }

    public AssignmentResponse toAssignmentResponse(MemberWorkoutAssignment a) {
        WorkoutPlan p = a.getPlan();
        return new AssignmentResponse(
            a.getId(), a.getMemberId(), p.getId(), p.getName(),
            p.getGoal(), p.getLevel(), a.getAssignedBy(),
            a.getStartDate(), a.getEndDate(), a.getStatus(),
            a.getCurrentWeek(), a.getNotes(), a.getCreatedAt()
        );
    }

    public WorkoutSetLogResponse toSetLogResponse(WorkoutSetLog s) {
        return new WorkoutSetLogResponse(
            s.getId(), s.getWorkoutExerciseId(), s.getExerciseId(),
            null, s.getSetNumber(), s.getRepsCompleted(), s.getWeightKg(),
            s.getDurationSeconds(), s.getRpeActual(), s.getNotes()
        );
    }

    public WorkoutLogResponse toLogResponse(WorkoutLog l) {
        List<WorkoutSetLogResponse> sets = l.getSetLogs() == null
            ? List.of()
            : l.getSetLogs().stream().map(this::toSetLogResponse).toList();
        return new WorkoutLogResponse(
            l.getId(), l.getMemberId(), l.getAssignmentId(), l.getPlanId(),
            null, l.getDayId(), null,
            l.getLogDate(), l.getStartedAt(), l.getCompletedAt(),
            l.getDurationMinutes(), l.getStatus(), l.getOverallFeeling(),
            l.getNotes(), l.getCreatedAt(), sets
        );
    }

    public PersonalRecordResponse toPrResponse(PersonalRecord pr) {
        Exercise ex = pr.getExercise();
        return new PersonalRecordResponse(
            pr.getId(), pr.getMemberId(), ex.getId(), ex.getName(), ex.getCategory(),
            pr.getRecordType(), pr.getValue(), pr.getUnit(),
            pr.getAchievedDate(), pr.getNotes(), pr.getCreatedAt()
        );
    }
}
