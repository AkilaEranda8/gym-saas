package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.modules.workout.enums.WorkoutGoal;
import com.gymapp.modules.workout.enums.WorkoutLevel;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutPlanRepository planRepository;
    private final WorkoutDayRepository dayRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutMapper mapper;
    private final CurrentUser currentUser;

    public PageResponse<WorkoutPlanResponse> listPlans(WorkoutGoal goal, WorkoutLevel level, String search, int page, int size) {
        UUID gymId = TenantContext.getGymId();
        var pg = planRepository.findByFilters(gymId, goal, level, search, PageRequest.of(page, size));
        return PageResponse.from(pg.map(mapper::toPlanResponse));
    }

    public List<WorkoutPlanResponse> listTemplates() {
        return planRepository.findTemplates(TenantContext.getGymId())
            .stream().map(mapper::toPlanResponse).toList();
    }

    public WorkoutPlanDetailResponse getPlan(UUID id) {
        UUID gymId = TenantContext.getGymId();
        WorkoutPlan plan = planRepository.findByIdAndGymIdAndDeletedAtIsNull(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Workout plan not found"));
        return mapper.toPlanDetailResponse(plan);
    }

    @Transactional
    public WorkoutPlanDetailResponse createPlan(CreateWorkoutPlanRequest req) {
        UUID gymId = TenantContext.getGymId();
        WorkoutPlan plan = new WorkoutPlan();
        plan.setGymId(gymId);
        plan.setCreatedBy(currentUser.getEmail());
        applyPlanFields(plan, req.name(), req.description(), req.goal(), req.level(),
            req.daysPerWeek(), req.durationWeeks(),
            req.durationMinutes() != null ? req.durationMinutes() : 60,
            req.tags(), req.equipmentNeeded(), req.notes());
        plan.setTemplate(req.template());
        planRepository.save(plan);
        if (req.days() != null) {
            saveDays(plan, req.days(), gymId);
        }
        return mapper.toPlanDetailResponse(planRepository.findByIdAndGymIdAndDeletedAtIsNull(plan.getId(), gymId).orElseThrow());
    }

    @Transactional
    public WorkoutPlanDetailResponse updatePlan(UUID id, UpdateWorkoutPlanRequest req) {
        UUID gymId = TenantContext.getGymId();
        WorkoutPlan plan = planRepository.findByIdAndGymIdAndDeletedAtIsNull(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Workout plan not found"));
        applyPlanFields(plan, req.name(), req.description(), req.goal(), req.level(),
            req.daysPerWeek(), req.durationWeeks(),
            req.durationMinutes() != null ? req.durationMinutes() : 60,
            req.tags(), req.equipmentNeeded(), req.notes());
        plan.getDays().clear();
        planRepository.save(plan);
        if (req.days() != null) {
            saveDays(plan, req.days(), gymId);
        }
        return mapper.toPlanDetailResponse(planRepository.findByIdAndGymIdAndDeletedAtIsNull(plan.getId(), gymId).orElseThrow());
    }

    @Transactional
    public void deletePlan(UUID id) {
        WorkoutPlan plan = planRepository.findByIdAndGymIdAndDeletedAtIsNull(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Workout plan not found"));
        plan.setDeletedAt(LocalDateTime.now());
        plan.setActive(false);
        planRepository.save(plan);
    }

    private void applyPlanFields(WorkoutPlan p, String name, String desc, WorkoutGoal goal,
                                  WorkoutLevel level, int daysPerWeek, int durationWeeks,
                                  int durationMinutes, String[] tags, String[] equipment, String notes) {
        p.setName(name);
        p.setDescription(desc);
        p.setGoal(goal);
        p.setLevel(level);
        p.setDaysPerWeek(daysPerWeek);
        p.setDurationWeeks(durationWeeks);
        p.setDurationMinutes(durationMinutes);
        p.setTags(tags);
        p.setEquipmentNeeded(equipment);
        p.setNotes(notes);
    }

    private void saveDays(WorkoutPlan plan, List<WorkoutDayRequest> dayReqs, UUID gymId) {
        for (WorkoutDayRequest dr : dayReqs) {
            WorkoutDay day = new WorkoutDay();
            day.setGymId(gymId);
            day.setPlan(plan);
            day.setDayNumber(dr.dayNumber());
            day.setName(dr.name());
            day.setFocus(dr.focus());
            day.setNotes(dr.notes());
            day.setEstimatedMinutes(dr.estimatedMinutes() != null ? dr.estimatedMinutes() : 60);
            dayRepository.save(day);

            if (dr.exercises() != null) {
                List<WorkoutExercise> wes = new ArrayList<>();
                for (WorkoutExerciseRequest er : dr.exercises()) {
                    Exercise ex = exerciseRepository.findByIdAndDeletedAtIsNull(er.exerciseId())
                        .orElseThrow(() -> new NoSuchElementException("Exercise not found: " + er.exerciseId()));
                    WorkoutExercise we = new WorkoutExercise();
                    we.setGymId(gymId);
                    we.setDay(day);
                    we.setExercise(ex);
                    we.setOrderIndex(er.orderIndex());
                    we.setSets(er.sets());
                    we.setReps(er.reps());
                    we.setDurationSeconds(er.durationSeconds());
                    we.setRestSeconds(er.restSeconds());
                    we.setWeightNote(er.weightNote());
                    we.setTempo(er.tempo());
                    we.setRpe(er.rpe());
                    we.setNotes(er.notes());
                    we.setSuperset(er.superset());
                    we.setSupersetGroup(er.supersetGroup());
                    wes.add(we);
                }
                day.setExercises(wes);
                dayRepository.save(day);
            }
        }
    }
}
