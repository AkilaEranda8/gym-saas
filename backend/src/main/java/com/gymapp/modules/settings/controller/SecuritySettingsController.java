package com.gymapp.modules.settings.controller;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.enums.LoginStatus;
import com.gymapp.modules.settings.service.SecuritySettingsService;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings/security")
@RequiredArgsConstructor
@PreAuthorize("hasRole('GYM_OWNER')")
public class SecuritySettingsController {

    private final SecuritySettingsService securityService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<SecuritySummaryDTO>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(
            securityService.getSecuritySummary(TenantContext.getGymId())));
    }

    @GetMapping("/login-history")
    public ResponseEntity<ApiResponse<PageResponse<LoginHistoryDTO>>> getLoginHistory(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) LoginStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
            securityService.getLoginHistory(TenantContext.getGymId(), userId, status, page, size)));
    }

    @GetMapping("/audit-settings")
    public ResponseEntity<ApiResponse<AuditSettingsDTO>> getAuditSettings() {
        return ResponseEntity.ok(ApiResponse.ok(
            securityService.getAuditSettings(TenantContext.getGymId())));
    }

    @PutMapping("/audit-settings")
    public ResponseEntity<ApiResponse<AuditSettingsDTO>> updateAuditSettings(
            @Valid @RequestBody UpdateAuditSettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
            securityService.updateAuditSettings(TenantContext.getGymId(), req)));
    }
}
