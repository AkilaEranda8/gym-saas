package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workout-logs")
@RequiredArgsConstructor
public class WorkoutLogController {

    private final WorkoutLogService logService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<PageResponse<WorkoutLogResponse>>> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(logService.listAll(page, size)));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PageResponse<WorkoutLogResponse>>> listForMember(
            @PathVariable UUID memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(logService.listForMember(memberId, page, size)));
    }

    @GetMapping("/member/{memberId}/range")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<WorkoutLogResponse>>> getRange(
            @PathVariable UUID memberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(logService.getRange(memberId, from, to)));
    }

    @GetMapping("/member/{memberId}/stats")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<WorkoutStatsResponse>> stats(@PathVariable UUID memberId) {
        return ResponseEntity.ok(ApiResponse.ok(logService.getStats(memberId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<WorkoutLogResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(logService.get(id)));
    }

    @PostMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<WorkoutLogResponse>> create(
            @PathVariable UUID memberId, @Valid @RequestBody CreateWorkoutLogRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(logService.create(memberId, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        logService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Workout log deleted", null));
    }
}
