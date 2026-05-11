package com.gymapp.modules.settings.controller;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.service.OperatingHoursService;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings/hours")
@RequiredArgsConstructor
public class OperatingHoursController {

    private final OperatingHoursService hoursService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OperatingHoursDTO>> getHours(
            @RequestParam(required = false) String branchId) {
        UUID bid = branchId != null ? UUID.fromString(branchId) : null;
        return ResponseEntity.ok(ApiResponse.ok(
            hoursService.getHours(TenantContext.getGymId(), bid)));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<OperatingHoursDTO>> updateHours(
            @RequestParam(required = false) String branchId,
            @Valid @RequestBody UpdateOperatingHoursRequest req) {
        UUID gymId = TenantContext.getGymId();
        UUID bid = branchId != null ? UUID.fromString(branchId) : null;
        hoursService.updateHours(gymId, bid, req);
        return ResponseEntity.ok(ApiResponse.ok(hoursService.getHours(gymId, bid)));
    }

    @GetMapping("/holidays")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<HolidayDTO>>> getHolidays() {
        return ResponseEntity.ok(ApiResponse.ok(
            hoursService.getAllHolidays(TenantContext.getGymId())));
    }

    @PostMapping("/holidays")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<HolidayDTO>> createHoliday(
            @Valid @RequestBody CreateHolidayRequest req) {
        return ResponseEntity.ok(ApiResponse.created(
            hoursService.createHoliday(TenantContext.getGymId(), req)));
    }

    @DeleteMapping("/holidays/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteHoliday(@PathVariable UUID id) {
        hoursService.deleteHoliday(TenantContext.getGymId(), id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/is-open")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> isOpen(
            @RequestParam(required = false) String branchId) {
        UUID bid = branchId != null ? UUID.fromString(branchId) : null;
        boolean open = hoursService.isOpenNow(TenantContext.getGymId(), bid);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("isOpen", open)));
    }
}
