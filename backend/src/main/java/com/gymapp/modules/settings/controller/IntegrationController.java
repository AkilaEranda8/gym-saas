package com.gymapp.modules.settings.controller;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.enums.IntegrationProvider;
import com.gymapp.modules.settings.service.IntegrationService;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/settings/integrations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GYM_OWNER')")
public class IntegrationController {

    private final IntegrationService integrationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<IntegrationDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(
            integrationService.getAll(TenantContext.getGymId())));
    }

    @GetMapping("/{provider}")
    public ResponseEntity<ApiResponse<IntegrationDTO>> getByProvider(
            @PathVariable IntegrationProvider provider) {
        return ResponseEntity.ok(ApiResponse.ok(
            integrationService.getByProvider(TenantContext.getGymId(), provider)));
    }

    @PutMapping("/{provider}")
    public ResponseEntity<ApiResponse<IntegrationDTO>> update(
            @PathVariable IntegrationProvider provider,
            @Valid @RequestBody UpdateIntegrationRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
            integrationService.update(TenantContext.getGymId(), provider, req)));
    }

    @PostMapping("/{provider}/test")
    public ResponseEntity<ApiResponse<IntegrationTestResultDTO>> test(
            @PathVariable IntegrationProvider provider) {
        return ResponseEntity.ok(ApiResponse.ok(
            integrationService.test(TenantContext.getGymId(), provider)));
    }
}
