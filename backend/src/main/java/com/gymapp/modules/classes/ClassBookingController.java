package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.*;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.CurrentUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classes/bookings")
@RequiredArgsConstructor
public class ClassBookingController {

    private final ClassBookingService bookingService;
    private final CurrentUser         currentUser;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ClassBookingDTO>> book(@Valid @RequestBody BookClassRequest req) {
        UUID memberId = req.memberId() != null
            ? req.memberId()
            : UUID.fromString(currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(bookingService.bookClass(req.sessionId(), memberId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ClassBookingDTO>> cancel(
            @PathVariable UUID id,
            @RequestBody(required = false) CancelBookingRequest req) {
        CancelBookingRequest body = req != null ? req : new CancelBookingRequest(null);
        return ResponseEntity.ok(ApiResponse.ok(bookingService.cancelBooking(id, body)));
    }

    @PostMapping("/{id}/mark-attended")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ClassBookingDTO>> markAttended(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.markAttended(id)));
    }

    @PostMapping("/{id}/mark-no-show")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<ClassBookingDTO>> markNoShow(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.markNoShow(id)));
    }

    @PostMapping("/sessions/{sessionId}/mark-all-attended")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> markAllAttended(@PathVariable UUID sessionId) {
        bookingService.markAllAttended(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("All bookings marked as attended", null));
    }

    @GetMapping("/my/upcoming")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<Page<MemberUpcomingClassDTO>>> myUpcoming(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID memberId = UUID.fromString(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getMemberUpcoming(memberId, page, size)));
    }

    @GetMapping("/my/history")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<Page<ClassBookingDTO>>> myHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID memberId = UUID.fromString(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getMemberHistory(memberId, page, size)));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Page<ClassBookingDTO>>> memberBookings(
            @PathVariable UUID memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(bookingService.getMemberHistory(memberId, page, size)));
    }
}
