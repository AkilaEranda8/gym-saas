package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/nutrition/supplements")
@RequiredArgsConstructor
public class SupplementController {

    private final SupplementService supplementService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<SupplementScheduleDTO>>> list(@RequestParam UUID memberId) {
        return ResponseEntity.ok(ApiResponse.ok(supplementService.getMemberSupplements(memberId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<SupplementScheduleDTO>> add(
            @RequestParam UUID memberId,
            @Valid @RequestBody AddSupplementRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(supplementService.addSupplement(memberId, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        supplementService.deleteSupplement(id);
        return ResponseEntity.ok(ApiResponse.ok("Supplement removed", null));
    }
}
