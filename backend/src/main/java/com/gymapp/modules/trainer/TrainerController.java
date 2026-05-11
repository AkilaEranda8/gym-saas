package com.gymapp.modules.trainer;

import com.gymapp.modules.trainer.dto.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trainers")
@RequiredArgsConstructor
public class TrainerController {

    private final TrainerService       trainerService;
    private final TrainerReportService reportService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'MEMBER')")
    public ResponseEntity<ApiResponse<Page<TrainerDTO>>> list(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) TrainerStatus status,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) TrainerSpecialty specialty) {
        return ResponseEntity.ok(ApiResponse.ok(
            trainerService.getAll(page, size, status, branchId, specialty)));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<TrainerStatsDTO>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(trainerService.getStats()));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<TrainerDTO>>> available(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)  LocalTime time,
            @RequestParam(required = false) TrainerSpecialty specialty) {
        return ResponseEntity.ok(ApiResponse.ok(
            trainerService.getAvailableForSlot(date, time, specialty)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<TrainerDetailDTO>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(trainerService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<TrainerDTO>> create(
            @Valid @RequestBody CreateTrainerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(trainerService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<TrainerDTO>> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateTrainerRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Trainer updated", trainerService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        trainerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Trainer removed", null));
    }

    @PostMapping("/{id}/certifications")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<CertificationDTO>> addCert(
            @PathVariable UUID id, @Valid @RequestBody AddCertificationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(trainerService.addCertification(id, req)));
    }

    @PatchMapping("/certifications/{certId}/verify")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<CertificationDTO>> verifyCert(@PathVariable UUID certId) {
        return ResponseEntity.ok(ApiResponse.ok(trainerService.verifyCertification(certId)));
    }

    @PutMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<AvailabilityDTO>>> setAvailability(
            @PathVariable UUID id, @Valid @RequestBody List<AvailabilityRequest> req) {
        return ResponseEntity.ok(ApiResponse.ok(trainerService.setAvailability(id, req)));
    }

    @GetMapping("/{id}/schedule")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<TrainerScheduleDTO>> schedule(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(
            trainerService.getDaySchedule(id, date != null ? date : LocalDate.now())));
    }

    @GetMapping("/reports/monthly")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TrainerMonthlyStatsDTO>>> monthlyReport(
            @RequestParam(defaultValue = "#{T(java.time.YearMonth).now().toString()}") String month) {
        return ResponseEntity.ok(ApiResponse.ok(
            reportService.getMonthlyReport(java.time.YearMonth.parse(month))));
    }

    @GetMapping("/reports/monthly/export")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<byte[]> exportMonthly(
            @RequestParam(defaultValue = "#{T(java.time.YearMonth).now().toString()}") String month) {
        String csv = reportService.exportToCsv(java.time.YearMonth.parse(month));
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=trainers-" + month + ".csv")
                .body(csv.getBytes());
    }
}
