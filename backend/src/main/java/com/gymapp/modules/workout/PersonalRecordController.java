package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/personal-records")
@RequiredArgsConstructor
public class PersonalRecordController {

    private final PersonalRecordService prService;

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<PersonalRecordResponse>>> listForMember(@PathVariable UUID memberId) {
        return ResponseEntity.ok(ApiResponse.ok(prService.listForMember(memberId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PersonalRecordResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(prService.get(id)));
    }

    @PostMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PersonalRecordResponse>> save(
            @PathVariable UUID memberId, @Valid @RequestBody CreatePersonalRecordRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(prService.save(memberId, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        prService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Personal record deleted", null));
    }
}
