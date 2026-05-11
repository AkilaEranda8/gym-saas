package com.gymapp.modules.settings.controller;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.service.*;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class GymSettingsController {

    private final GymSettingsService gymSettingsService;
    private final GymSettingKVService kvService;
    private final IntegrationService integrationService;
    private final MembershipPlanConfigService planService;
    private final OperatingHoursService hoursService;
    private final FeatureFlagService featureService;
    private final SecuritySettingsService securityService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<FullSettingsDTO>> fullSettings() {
        UUID gymId = TenantContext.getGymId();
        FullSettingsDTO dto = new FullSettingsDTO(
            gymSettingsService.getSettings(gymId),
            kvService.getByCategories(gymId),
            integrationService.getAll(gymId),
            planService.getAll(gymId),
            hoursService.getHours(gymId, null),
            hoursService.getUpcomingHolidays(gymId, 30),
            featureService.getAllFeatures(gymId),
            securityService.getAuditSettings(gymId)
        );
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/gym")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<GymSettingsDTO>> getGymSettings() {
        return ResponseEntity.ok(ApiResponse.ok(
            gymSettingsService.getSettings(TenantContext.getGymId())));
    }

    @PutMapping("/gym")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<GymSettingsDTO>> updateGymSettings(
            @Valid @RequestBody UpdateGymSettingsRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
            gymSettingsService.update(TenantContext.getGymId(), req)));
    }

    @PutMapping("/theme")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<GymSettingsDTO>> updateTheme(
            @Valid @RequestBody UpdateThemeRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
            gymSettingsService.updateTheme(TenantContext.getGymId(), req)));
    }

    @PutMapping("/localization")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<GymSettingsDTO>> updateLocalization(
            @Valid @RequestBody UpdateLocalizationRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
            gymSettingsService.updateLocalization(TenantContext.getGymId(), req)));
    }

    @PostMapping("/logo")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        String url = gymSettingsService.uploadLogo(TenantContext.getGymId(), file);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url)));
    }

    @PostMapping("/cover-image")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadCoverImage(
            @RequestParam("file") MultipartFile file) {
        String url = gymSettingsService.uploadCoverImage(TenantContext.getGymId(), file);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", url)));
    }

    @GetMapping("/kv")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<SettingsByCategoryDTO>>> getKV() {
        return ResponseEntity.ok(ApiResponse.ok(
            kvService.getByCategories(TenantContext.getGymId())));
    }

    @PutMapping("/kv")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<SettingsByCategoryDTO>>> updateKV(
            @RequestBody Map<String, String> values) {
        UUID gymId = TenantContext.getGymId();
        kvService.setBulk(gymId, values, "MANAGER");
        return ResponseEntity.ok(ApiResponse.ok(kvService.getByCategories(gymId)));
    }
}
