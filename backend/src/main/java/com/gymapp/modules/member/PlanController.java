package com.gymapp.modules.member;

import com.gymapp.modules.member.dto.PlanRequest;
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
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanService planService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<Plan>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(planService.listPlans()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Plan>> create(@Valid @RequestBody PlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(planService.createPlan(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Plan>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Plan updated", planService.updatePlan(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        planService.deactivatePlan(id);
        return ResponseEntity.ok(ApiResponse.ok("Plan deactivated", null));
    }
}
