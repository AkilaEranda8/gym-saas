package com.gymapp.modules.member;

import com.gymapp.modules.member.dto.*;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.enums.MemberStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService      memberService;
    private final MemberExportService exportService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Page<MemberResponse>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MemberStatus status,
            @RequestParam(required = false) UUID branchId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.listMembers(search, status, branchId, pageable)));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MemberStatsDTO>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getStats()));
    }

    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> expiring(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getExpiringMembers(days)));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = exportService.exportMembersCsv();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"members.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<MemberDetailDTO>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getMemberDetail(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MemberResponse>> create(
            @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(memberService.createMember(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MemberResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Member updated", memberService.updateMember(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.ok("Member deleted", null));
    }

    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<MemberResponse>> suspend(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Member suspended", memberService.suspendMember(id)));
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MemberResponse>> reactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Member reactivated", memberService.reactivateMember(id)));
    }

    @GetMapping("/{id}/qr")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<byte[]> getQrImage(@PathVariable UUID id) {
        byte[] png = memberService.generateQrCodeImage(id);
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(png);
    }

    @PostMapping("/{id}/checkin")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<CheckInResponse>> checkIn(
            @PathVariable UUID id,
            @RequestBody(required = false) CheckInRequest req) {
        CheckInRequest request = req != null ? req
            : new CheckInRequest(null, id, CheckInMethod.MANUAL);
        return ResponseEntity.ok(ApiResponse.ok(memberService.checkIn(request)));
    }

    @PostMapping("/{id}/checkout")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> checkOut(@PathVariable UUID id) {
        memberService.checkOut(id);
        return ResponseEntity.ok(ApiResponse.ok("Checked out", null));
    }

    @PostMapping("/{id}/body-metrics")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<BodyMetricDTO>> addBodyMetric(
            @PathVariable UUID id,
            @Valid @RequestBody AddBodyMetricRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(memberService.addBodyMetric(id, req)));
    }

    @GetMapping("/{id}/body-metrics")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<BodyMetricDTO>>> getBodyMetrics(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getBodyMetrics(id)));
    }

    @GetMapping("/{id}/attendance")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<AttendanceDTO>>> getAttendance(
            @PathVariable UUID id,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getAttendance(id, pageable)));
    }

    @PostMapping("/{id}/plans")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<MemberPlan>> assignPlan(
            @PathVariable UUID id,
            @Valid @RequestBody AssignPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(memberService.assignPlan(id, request)));
    }
}
