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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pt-sessions")
@RequiredArgsConstructor
public class PTSessionController {

    private final PTSessionService         sessionService;
    private final TrainerReviewService     reviewService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Page<PTSessionDTO>>> list(
            @RequestParam(required = false) UUID trainerId,
            @RequestParam(required = false) UUID memberId,
            @RequestParam(required = false) PTSessionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
            sessionService.getAll(trainerId, memberId, status, from, to, page, size)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<PTSessionDTO>> create(
            @Valid @RequestBody CreatePTSessionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(sessionService.create(req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<PTSessionDTO>> updateStatus(
            @PathVariable UUID id, @Valid @RequestBody UpdateSessionStatusRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.updateStatus(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancel(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        sessionService.cancel(id, body != null ? body.get("reason") : null);
        return ResponseEntity.ok(ApiResponse.ok("Session cancelled", null));
    }

    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<Page<PTSessionDTO>>> memberSessions(
            @PathVariable UUID memberId,
            @RequestParam(required = false) PTSessionStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
            sessionService.getMemberSessions(memberId, status, page, size)));
    }

    @PostMapping("/trainer/{trainerId}/reviews")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<ReviewDTO>> addReview(
            @PathVariable UUID trainerId,
            @Valid @RequestBody AddReviewRequest req,
            @RequestParam UUID memberId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(reviewService.addReview(trainerId, req, memberId)));
    }

    @GetMapping("/trainer/{trainerId}/reviews")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<Page<ReviewDTO>>> getReviews(
            @PathVariable UUID trainerId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviews(trainerId, page, size)));
    }
}
