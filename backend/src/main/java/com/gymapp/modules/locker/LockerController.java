package com.gymapp.modules.locker;

import com.gymapp.modules.locker.LockerDtos.*;
import com.gymapp.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/lockers")
@RequiredArgsConstructor
public class LockerController {

    private final LockerService lockerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LockerDTO>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(lockerService.listLockers()));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<LockerDTO>>> available() {
        return ResponseEntity.ok(ApiResponse.ok(lockerService.listAvailableLockers()));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<LockerStatsDTO>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(lockerService.getStats()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<LockerDTO>> create(@RequestBody CreateLockerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(lockerService.createLocker(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<LockerDTO>> update(@PathVariable UUID id,
                                                         @RequestBody UpdateLockerRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(lockerService.updateLocker(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        lockerService.deleteLocker(id);
        return ResponseEntity.ok(ApiResponse.ok("Locker deleted", null));
    }

    @PostMapping("/{lockerId}/assign")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<LockerAssignmentDTO>> assign(
            @PathVariable UUID lockerId,
            @RequestBody AssignLockerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(lockerService.assignLocker(lockerId, req)));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> release(@PathVariable UUID assignmentId) {
        lockerService.releaseLocker(assignmentId);
        return ResponseEntity.ok(ApiResponse.ok("Locker released", null));
    }

    @GetMapping("/assignments")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LockerAssignmentDTO>>> assignments(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.ok(lockerService.listAssignments(status)));
    }

    @GetMapping("/members/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<LockerAssignmentDTO>>> memberLockers(@PathVariable UUID memberId) {
        return ResponseEntity.ok(ApiResponse.ok(lockerService.getMemberLockers(memberId)));
    }
}
