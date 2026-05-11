package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.modules.equipment.enums.MaintenancePriority;
import com.gymapp.modules.equipment.enums.MaintenanceStatus;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/equipment/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService     maintenanceService;
    private final EquipmentReportService reportService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<PageResponse<MaintenanceRequestDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String equipmentId,
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) MaintenancePriority priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(
            maintenanceService.getAll(page, size, equipmentId, status, priority, from, to)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<MaintenanceRequestDetailDTO>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER','MEMBER')")
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> create(
            @Valid @RequestBody CreateMaintenanceRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(maintenanceService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> update(
            @PathVariable String id, @Valid @RequestBody UpdateMaintenanceRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Request updated", maintenanceService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<MaintenanceRequestDTO>> updateStatus(
            @PathVariable String id, @Valid @RequestBody UpdateMaintenanceStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", maintenanceService.updateStatus(id, req)));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<MaintenanceLogDTO>> addComment(
            @PathVariable String id, @Valid @RequestBody AddMaintenanceCommentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(maintenanceService.addComment(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        maintenanceService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Request deleted", null));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<MaintenanceSummaryDTO>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(maintenanceService.getSummary()));
    }

    @GetMapping("/report/csv")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        byte[] csv = reportService.exportMaintenanceCsv(from, to);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"maintenance.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }
}
