package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/nutrition/logs")
@RequiredArgsConstructor
public class NutritionLogController {

    private final NutritionLogService logService;

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('MEMBER', 'TRAINER', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<NutritionLogDetailDTO>> today(@RequestParam UUID memberId) {
        return ResponseEntity.ok(ApiResponse.ok(logService.getTodayLog(memberId)));
    }

    @GetMapping("/date")
    @PreAuthorize("hasAnyRole('MEMBER', 'TRAINER', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<NutritionLogDetailDTO>> byDate(
            @RequestParam UUID memberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(logService.getLogByDate(memberId, date)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MEMBER', 'TRAINER', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<PageResponse<NutritionLogDTO>>> list(
            @RequestParam UUID memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        return ResponseEntity.ok(ApiResponse.ok(logService.getMemberLogs(memberId, from, to, page, size)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MEMBER', 'TRAINER', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<NutritionLogDetailDTO>> log(
            @RequestParam UUID memberId,
            @Valid @RequestBody LogNutritionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(logService.logNutrition(memberId, req)));
    }

    @GetMapping("/progress")
    @PreAuthorize("hasAnyRole('MEMBER', 'TRAINER', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<NutritionProgressDTO>> progress(
            @RequestParam UUID memberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(logService.getProgress(memberId, from, to)));
    }

    @GetMapping("/water")
    @PreAuthorize("hasAnyRole('MEMBER', 'TRAINER', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<DailyWaterSummaryDTO>> waterSummary(
            @RequestParam UUID memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(logService.getWaterSummary(memberId, target)));
    }

    @PostMapping("/water")
    @PreAuthorize("hasAnyRole('MEMBER', 'TRAINER', 'GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<WaterLogDTO>> logWater(
            @RequestParam UUID memberId,
            @Valid @RequestBody LogWaterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(logService.logWater(memberId, req)));
    }
}
