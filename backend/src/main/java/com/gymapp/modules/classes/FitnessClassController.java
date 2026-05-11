package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class FitnessClassController {

    private final FitnessClassService classService;
    private final ClassSessionService sessionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Page<FitnessClassDTO>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) ClassType type,
            @RequestParam(required = false) UUID trainerId,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(classService.getAll(page, size, type, trainerId, branchId)));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ClassStatsDTO>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getStats()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ClassDetailDTO>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(classService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<FitnessClassDTO>> create(@Valid @RequestBody CreateClassRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(classService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<FitnessClassDTO>> update(
            @PathVariable String id,
            @Valid @RequestBody UpdateClassRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(classService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        classService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Class deleted successfully", null));
    }

    @PostMapping("/{id}/schedules")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ClassScheduleDTO>> addSchedule(
            @PathVariable String id,
            @Valid @RequestBody CreateScheduleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(classService.addSchedule(id, req)));
    }

    @DeleteMapping("/schedules/{scheduleId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeSchedule(@PathVariable String scheduleId) {
        classService.removeSchedule(scheduleId);
        return ResponseEntity.ok(ApiResponse.ok("Schedule removed", null));
    }
}
