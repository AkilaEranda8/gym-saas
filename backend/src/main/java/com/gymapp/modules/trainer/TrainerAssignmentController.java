package com.gymapp.modules.trainer;

import com.gymapp.modules.trainer.dto.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trainer-assignments")
@RequiredArgsConstructor
public class TrainerAssignmentController {

    private final TrainerAssignmentService assignmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<AssignmentDTO>>> list(
            @RequestParam(required = false) UUID trainerId,
            @RequestParam(required = false) UUID memberId,
            @RequestParam(required = false) AssignmentStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
            assignmentService.getAll(trainerId, memberId, status, page, size)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<AssignmentDTO>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<AssignmentDTO>> create(
            @Valid @RequestBody CreateAssignmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(assignmentService.create(req)));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<AssignmentDTO>> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Assignment completed", assignmentService.complete(id)));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<AssignmentDTO>> cancel(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Assignment cancelled",
            assignmentService.cancel(id, body != null ? body.get("reason") : null)));
    }
}
