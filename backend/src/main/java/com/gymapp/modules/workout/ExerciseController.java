package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.modules.workout.enums.ExerciseCategory;
import com.gymapp.modules.workout.enums.ExerciseEquipment;
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
@RequestMapping("/api/v1/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PageResponse<ExerciseResponse>>> list(
            @RequestParam(required = false) ExerciseCategory category,
            @RequestParam(required = false) ExerciseEquipment equipment,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.ok(exerciseService.list(category, equipment, search, page, size)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<ExerciseResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.ok(exerciseService.listAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<ExerciseResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(exerciseService.get(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<ExerciseResponse>> create(@Valid @RequestBody CreateExerciseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(exerciseService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<ExerciseResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody CreateExerciseRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Exercise updated", exerciseService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        exerciseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Exercise deleted", null));
    }
}
