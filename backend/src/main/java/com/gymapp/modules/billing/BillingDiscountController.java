package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing/discounts")
@RequiredArgsConstructor
public class BillingDiscountController {

    private final DiscountService discountService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<DiscountDTO>> create(
            @Valid @RequestBody CreateDiscountRequest req) {
        return ResponseEntity.status(201).body(ApiResponse.created(discountService.create(req)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<DiscountDTO>>> list(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(discountService.list(pageable)));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<DiscountDTO>>> listActive() {
        return ResponseEntity.ok(ApiResponse.ok(discountService.listActive()));
    }

    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<DiscountValidationDTO>> validate(
            @Valid @RequestBody ValidateDiscountRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(discountService.validate(req)));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<DiscountDTO>> toggle(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(discountService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        discountService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Discount deleted", null));
    }
}
