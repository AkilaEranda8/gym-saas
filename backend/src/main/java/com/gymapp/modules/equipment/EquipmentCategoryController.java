package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment/categories")
@RequiredArgsConstructor
public class EquipmentCategoryController {

    private final EquipmentCategoryService categoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER','MEMBER')")
    public ResponseEntity<ApiResponse<List<EquipmentCategoryDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAll()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<EquipmentCategoryDTO>> create(
            @Valid @RequestBody CreateCategoryRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(categoryService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<EquipmentCategoryDTO>> update(
            @PathVariable String id, @Valid @RequestBody CreateCategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Category updated", categoryService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted", null));
    }
}
