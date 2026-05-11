package com.gymapp.modules.settings.controller;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.service.MembershipPlanConfigService;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/settings/plans")
@RequiredArgsConstructor
public class MembershipPlanController {

    private final MembershipPlanConfigService planService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MembershipPlanConfigDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(
            planService.getAll(TenantContext.getGymId())));
    }

    @GetMapping("/{planName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MembershipPlanConfigDTO>> getByPlan(
            @PathVariable String planName) {
        return ResponseEntity.ok(ApiResponse.ok(
            planService.getByPlan(TenantContext.getGymId(), planName)));
    }

    @PutMapping("/{planName}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<MembershipPlanConfigDTO>> update(
            @PathVariable String planName,
            @Valid @RequestBody UpdateMembershipPlanRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
            planService.update(TenantContext.getGymId(), planName, req)));
    }

    @PutMapping("/reorder")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<List<MembershipPlanConfigDTO>>> reorder(
            @RequestBody List<String> planOrder) {
        planService.reorder(TenantContext.getGymId(), planOrder);
        return ResponseEntity.ok(ApiResponse.ok(
            planService.getAll(TenantContext.getGymId())));
    }
}
