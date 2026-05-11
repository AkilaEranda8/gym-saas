package com.gymapp.modules.workout;

import com.gymapp.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/daily-workouts")
@RequiredArgsConstructor
public class DailyWorkoutController {

    private final DailyWorkoutService service;

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER','MEMBER')")
    public ResponseEntity<ApiResponse<DailyWorkout>> today() {
        return ResponseEntity.ok(ApiResponse.ok(service.getByDate(LocalDate.now()).orElse(null)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER','MEMBER')")
    public ResponseEntity<ApiResponse<List<DailyWorkout>>> week(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(service.getWeek(from, to)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<DailyWorkout>> upsert(
            @RequestBody DailyWorkoutService.WodRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.upsert(req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }
}
