package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.modules.equipment.enums.EquipmentStatus;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService       equipmentService;
    private final EquipmentReportService reportService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER','MEMBER')")
    public ResponseEntity<ApiResponse<PageResponse<EquipmentDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) EquipmentStatus status,
            @RequestParam(required = false) String branchId,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(
            equipmentService.getAll(page, size, categoryId, status, branchId, search)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER','MEMBER')")
    public ResponseEntity<ApiResponse<EquipmentDetailDTO>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getById(id)));
    }

    @GetMapping("/qr/{qrCode}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER','MEMBER')")
    public ResponseEntity<ApiResponse<EquipmentDTO>> getByQrCode(@PathVariable String qrCode) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getByQrCode(qrCode)));
    }

    @GetMapping("/{id}/qr-code")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<byte[]> getQrCode(@PathVariable String id) {
        byte[] png = equipmentService.generateQrCode(id);
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(png);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<EquipmentDTO>> create(@Valid @RequestBody CreateEquipmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(equipmentService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<EquipmentDTO>> update(
            @PathVariable String id, @Valid @RequestBody UpdateEquipmentRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Equipment updated", equipmentService.update(id, req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<EquipmentDTO>> updateStatus(
            @PathVariable String id, @Valid @RequestBody UpdateEquipmentStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", equipmentService.updateStatus(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        equipmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Equipment deleted", null));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<EquipmentStatsDTO>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getStats()));
    }

    @GetMapping("/service-due")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<EquipmentDTO>>> getServiceDueSoon(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getServiceDueSoon(days)));
    }

    @GetMapping("/service-overdue")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<EquipmentDTO>>> getServiceOverdue() {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.getServiceOverdue()));
    }

    @GetMapping("/report/csv")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = reportService.exportEquipmentCsv();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"equipment.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/report/dashboard")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Object>> getDashboardReport() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDashboardReport()));
    }
}
