package com.gymapp.modules.reports;

import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.modules.reports.enums.ReportType;
import com.gymapp.shared.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
public class ReportController {

    private final DashboardReportService  dashboardService;
    private final RevenueReportService    revenueService;
    private final MemberReportService     memberService;
    private final AttendanceReportService attendanceService;
    private final TrainerPerformanceReportService trainerService;
    private final ClassReportService      classService;
    private final ShopReportService       shopService;
    private final EquipmentReportService  equipmentService;
    private final LankaInsightsService    lankaService;
    private final ReportExportService     exportService;
    private final ScheduledReportService  scheduledService;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard/kpis")
    public ResponseEntity<ApiResponse<DashboardKpiDTO>> kpis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getKPIsForPeriod(from, to)));
    }

    @GetMapping("/dashboard/today")
    public ResponseEntity<ApiResponse<DashboardKpiDTO>> today() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getTodayKPIs()));
    }

    // ── Revenue ───────────────────────────────────────────────────────────────

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportDTO>> revenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(revenueService.generate(from, to)));
    }

    @GetMapping("/revenue/monthly-trend")
    public ResponseEntity<ApiResponse<List<MonthlyRevenueDTO>>> monthlyTrend(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(ApiResponse.ok(revenueService.getMonthlyTrend(months)));
    }

    // ── Members ───────────────────────────────────────────────────────────────

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<MemberReportDTO>> members(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(memberService.generate(from, to)));
    }

    @GetMapping("/members/growth-trend")
    public ResponseEntity<ApiResponse<List<MonthlyGrowthDTO>>> growthTrend(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getGrowthTrend(months)));
    }

    // ── Attendance ────────────────────────────────────────────────────────────

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<AttendanceReportDTO>> attendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String branchId) {
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.generate(from, to, branchId)));
    }

    @GetMapping("/attendance/heatmap")
    public ResponseEntity<ApiResponse<java.util.Map<Integer, Long>>> attendanceHeatmap(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().minusDays(30);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getHourlyHeatmap(from, to)));
    }

    // ── Trainers ──────────────────────────────────────────────────────────────

    @GetMapping("/trainers")
    public ResponseEntity<ApiResponse<TrainerPerformanceReportDTO>> trainers(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(trainerService.generate(from, to)));
    }

    // ── Classes ───────────────────────────────────────────────────────────────

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<ClassReportDTO>> classes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(classService.generate(from, to)));
    }

    // ── Shop ──────────────────────────────────────────────────────────────────

    @GetMapping("/shop")
    public ResponseEntity<ApiResponse<ShopReportDTO>> shop(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(shopService.generate(from, to)));
    }

    // ── Equipment ─────────────────────────────────────────────────────────────

    @GetMapping("/equipment")
    public ResponseEntity<ApiResponse<EquipmentReportDTO>> equipment(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.generate(from, to)));
    }

    // ── Lanka Insights ────────────────────────────────────────────────────────

    @GetMapping("/lanka-insights")
    public ResponseEntity<ApiResponse<LankaInsightsDTO>> lankaInsights() {
        return ResponseEntity.ok(ApiResponse.ok(lankaService.generate()));
    }

    // ── Exports ───────────────────────────────────────────────────────────────

    @GetMapping("/exports")
    public ResponseEntity<ApiResponse<List<ReportExportDTO>>> listExports(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(exportService.listExports(page, size)));
    }

    @GetMapping("/exports/csv/{type}")
    public void downloadCsv(
            @PathVariable ReportType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletResponse response) throws Exception {
        if (from == null) from = LocalDate.now().withDayOfMonth(1);
        if (to   == null) to   = LocalDate.now();
        String user = jwt != null ? jwt.getClaimAsString("preferred_username") : "system";
        String csv  = exportService.exportCsv(type, from, to, user);
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + type.name().toLowerCase() + "_" + from + "_" + to + ".csv\"");
        response.getWriter().write(csv);
    }

    // ── Scheduled Reports ─────────────────────────────────────────────────────

    @GetMapping("/scheduled")
    public ResponseEntity<ApiResponse<List<ScheduledReportDTO>>> listScheduled() {
        return ResponseEntity.ok(ApiResponse.ok(scheduledService.listActive()));
    }

    @PostMapping("/scheduled")
    public ResponseEntity<ApiResponse<ScheduledReportDTO>> createScheduled(
            @Valid @RequestBody CreateScheduledReportRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(scheduledService.create(req)));
    }

    @PatchMapping("/scheduled/{id}/toggle")
    public ResponseEntity<ApiResponse<ScheduledReportDTO>> toggleScheduled(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(scheduledService.toggleActive(id)));
    }

    @DeleteMapping("/scheduled/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteScheduled(@PathVariable UUID id) {
        scheduledService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
