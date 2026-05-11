package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.modules.workout.enums.WorkoutGoal;
import com.gymapp.modules.workout.enums.WorkoutLevel;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PageResponse<WorkoutPlanResponse>>> list(
            @RequestParam(required = false) WorkoutGoal goal,
            @RequestParam(required = false) WorkoutLevel level,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(workoutService.listPlans(goal, level, search, page, size)));
    }

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<WorkoutPlanResponse>>> templates() {
        return ResponseEntity.ok(ApiResponse.ok(workoutService.listTemplates()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<WorkoutPlanDetailResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(workoutService.getPlan(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<WorkoutPlanDetailResponse>> create(@Valid @RequestBody CreateWorkoutPlanRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(workoutService.createPlan(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<WorkoutPlanDetailResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateWorkoutPlanRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Workout plan updated", workoutService.updatePlan(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        workoutService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.ok("Workout plan deleted", null));
    }
}
