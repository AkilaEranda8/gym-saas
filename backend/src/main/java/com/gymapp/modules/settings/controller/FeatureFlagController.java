package com.gymapp.modules.settings.controller;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.enums.FeatureKey;
import com.gymapp.modules.settings.service.FeatureFlagService;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings/features")
@RequiredArgsConstructor
public class FeatureFlagController {

    private final FeatureFlagService featureService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<AllFeaturesDTO>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(
            featureService.getAllFeatures(TenantContext.getGymId())));
    }

    @PutMapping
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<AllFeaturesDTO>> update(
            @Valid @RequestBody UpdateFeatureFlagsRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
            featureService.updateFlags(TenantContext.getGymId(), req)));
    }

    @GetMapping("/{featureKey}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkFeature(
            @PathVariable String featureKey) {
        boolean enabled;
        try {
            enabled = featureService.isEnabled(TenantContext.getGymId(),
                FeatureKey.valueOf(featureKey.toUpperCase()));
        } catch (IllegalArgumentException e) {
            enabled = true;
        }
        return ResponseEntity.ok(ApiResponse.ok(Map.of("enabled", enabled)));
    }
}
