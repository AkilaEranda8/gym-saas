package com.gymapp.modules.trainer;

import com.gymapp.modules.trainer.dto.ApproveLeaveRequest;
import com.gymapp.modules.trainer.dto.RequestLeaveRequest;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trainer-leave")
@RequiredArgsConstructor
public class TrainerLeaveController {

    private final TrainerLeaveService leaveService;
    private final CurrentUser         currentUser;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TrainerLeaveService.LeaveDTO>>> list(
            @RequestParam(required = false) LeaveStatus status,
            @RequestParam UUID gymId) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getAll(gymId, status)));
    }

    @GetMapping("/trainer/{trainerId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<TrainerLeaveService.LeaveDTO>>> trainerLeave(
            @PathVariable UUID trainerId) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getTrainerLeave(trainerId)));
    }

    @PostMapping("/trainer/{trainerId}/request")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<TrainerLeaveService.LeaveDTO>> request(
            @PathVariable UUID trainerId,
            @Valid @RequestBody RequestLeaveRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(leaveService.requestLeave(trainerId, req)));
    }

    @PatchMapping("/{leaveId}/review")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<TrainerLeaveService.LeaveDTO>> review(
            @PathVariable UUID leaveId,
            @Valid @RequestBody ApproveLeaveRequest req) {
        String approver = currentUser.getEmail() != null ? currentUser.getEmail() : "Manager";
        return ResponseEntity.ok(ApiResponse.ok(leaveService.approveOrReject(leaveId, req, approver)));
    }
}
