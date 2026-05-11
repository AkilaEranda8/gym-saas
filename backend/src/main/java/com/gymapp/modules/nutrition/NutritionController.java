package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.modules.nutrition.enums.NutritionGoal;
import com.gymapp.shared.ApiResponse;
import com.gymapp.shared.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/nutrition/plans")
@RequiredArgsConstructor
public class NutritionController {

    private final NutritionService nutritionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PageResponse<NutritionPlanDTO>>> list(
            @RequestParam(required = false) NutritionGoal goal,
            @RequestParam(required = false) Boolean isTemplate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(nutritionService.listPlans(goal, isTemplate, search, page, size)));
    }

    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<NutritionPlanDTO>>> templates() {
        return ResponseEntity.ok(ApiResponse.ok(nutritionService.listTemplates()));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<NutritionStatsDTO>> stats() {
        return ResponseEntity.ok(ApiResponse.ok(nutritionService.getStats()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<NutritionPlanDetailDTO>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(nutritionService.getPlan(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<NutritionPlanDetailDTO>> create(
            @Valid @RequestBody CreateNutritionPlanRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(nutritionService.createPlan(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<NutritionPlanDetailDTO>> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateNutritionPlanRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Nutrition plan updated", nutritionService.updatePlan(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        nutritionService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.ok("Nutrition plan deleted", null));
    }
}
