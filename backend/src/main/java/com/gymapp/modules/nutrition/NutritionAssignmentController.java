package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.modules.nutrition.enums.NutritionAssignmentStatus;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/nutrition/assignments")
@RequiredArgsConstructor
public class NutritionAssignmentController {

    private final NutritionAssignmentService assignmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<PageResponse<NutritionAssignmentDTO>>> list(
            @RequestParam(required = false) NutritionAssignmentStatus status,
            @RequestParam(required = false) UUID planId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.listAssignments(status, planId, page, size)));
    }

    @GetMapping("/member/{memberId}/active")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<NutritionAssignmentDTO>> getActiveAssignment(
            @PathVariable UUID memberId) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getMemberActiveAssignment(memberId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<NutritionAssignmentDTO>> assign(
            @Valid @RequestBody AssignNutritionPlanRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(assignmentService.assignPlan(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<NutritionAssignmentDTO>> updateStatus(
            @PathVariable UUID id,
            @RequestParam NutritionAssignmentStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", assignmentService.updateStatus(id, status)));
    }
}
