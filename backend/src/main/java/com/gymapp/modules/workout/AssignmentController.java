package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
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
@RequestMapping("/api/v1/workout-assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<PageResponse<AssignmentResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.list(page, size)));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> listForMember(@PathVariable UUID memberId) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.listForMember(memberId)));
    }

    @GetMapping("/member/{memberId}/active")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getActive(@PathVariable UUID memberId) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getActive(memberId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.get(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> assign(@Valid @RequestBody AssignWorkoutRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(assignmentService.assign(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody UpdateAssignmentStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", assignmentService.updateStatus(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        assignmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Assignment cancelled", null));
    }
}
