package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
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
@RequestMapping("/api/v1/equipment/service")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService         serviceService;
    private final EquipmentReportService reportService;

    @GetMapping("/schedules/{equipmentId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<List<ServiceScheduleDTO>>> getSchedules(
            @PathVariable String equipmentId) {
        return ResponseEntity.ok(ApiResponse.ok(serviceService.getSchedulesByEquipment(equipmentId)));
    }

    @GetMapping("/schedules/upcoming")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<ServiceScheduleDTO>>> getUpcoming(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(ApiResponse.ok(serviceService.getUpcomingSchedules(days)));
    }

    @PostMapping("/schedules")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ServiceScheduleDTO>> createSchedule(
            @Valid @RequestBody CreateServiceScheduleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(serviceService.createSchedule(req)));
    }

    @DeleteMapping("/schedules/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable String id) {
        serviceService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.ok("Schedule deactivated", null));
    }

    @GetMapping("/records/{equipmentId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<PageResponse<ServiceRecordDTO>>> getRecords(
            @PathVariable String equipmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(serviceService.getRecordsByEquipment(equipmentId, page, size)));
    }

    @PostMapping("/records")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ServiceRecordDTO>> createRecord(
            @Valid @RequestBody CreateServiceRecordRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(serviceService.createRecord(req)));
    }

    @GetMapping("/cost-report/{year}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Object>> getCostReport(@PathVariable int year) {
        return ResponseEntity.ok(ApiResponse.ok(serviceService.getServiceCostReport(year)));
    }

    @GetMapping("/records/export/{year}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<byte[]> exportServiceCsv(@PathVariable int year) {
        byte[] csv = reportService.exportServiceCostCsv(year);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"service-records-" + year + ".csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }
}
