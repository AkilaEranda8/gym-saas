package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.*;
import com.gymapp.shared.ApiResponse;
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
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classes/sessions")
@RequiredArgsConstructor
public class ClassSessionController {

    private final ClassSessionService  sessionService;
    private final ClassBookingService  bookingService;
    private final ClassReportService   reportService;

    @GetMapping("/week")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WeekScheduleDTO>> weekSchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getWeekSchedule(weekStart, branchId)));
    }

    @GetMapping("/day")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ClassSessionDTO>>> daySchedule(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getDaySchedule(date, branchId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ClassSessionDTO>> getSession(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSession(id)));
    }

    @GetMapping("/{id}/bookings")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<List<ClassBookingDTO>>> sessionBookings(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSessionBookings(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ClassSessionDTO>> createSession(
            @Valid @RequestBody CreateSessionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(sessionService.createSession(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ClassSessionDTO>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateSessionStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.updateSessionStatus(id, req)));
    }

    @PostMapping("/{id}/mark-all-attended")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> markAllAttended(@PathVariable UUID id) {
        bookingService.markAllAttended(id);
        return ResponseEntity.ok(ApiResponse.ok("All members marked as attended", null));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<byte[]> exportSessionsCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        byte[] csv = reportService.exportSessionsCsv(from, to);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"sessions.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/bookings/export")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<byte[]> exportBookingsCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        byte[] csv = reportService.exportBookingsCsv(from, to);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bookings.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }
}
