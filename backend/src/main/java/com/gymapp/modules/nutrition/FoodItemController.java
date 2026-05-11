package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.modules.nutrition.enums.FoodCategory;
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
@RequestMapping("/api/v1/nutrition/foods")
@RequiredArgsConstructor
public class FoodItemController {

    private final FoodItemService foodItemService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<PageResponse<FoodItemDTO>>> list(
            @RequestParam(required = false) FoodCategory category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.listFoodItems(category, search, page, size)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<FoodItemDTO>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.searchFoodItems(q)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<FoodItemDTO>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(foodItemService.getFoodItem(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<FoodItemDTO>> create(@Valid @RequestBody CreateFoodItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(foodItemService.createFoodItem(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<FoodItemDTO>> update(
            @PathVariable UUID id, @Valid @RequestBody CreateFoodItemRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Food item updated", foodItemService.updateFoodItem(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Food item deleted", null));
    }
}
