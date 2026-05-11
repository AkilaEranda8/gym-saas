package com.gymapp.modules.shop.controller;

import com.gymapp.modules.shop.dto.*;
import com.gymapp.modules.shop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ── Categories ──────────────────────────────────────────────

    @GetMapping("/categories")
    public ResponseEntity<List<ProductCategoryDTO>> listCategories(
        @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(productService.listCategories(activeOnly));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
    public ResponseEntity<ProductCategoryDTO> createCategory(
        @Valid @RequestBody CreateCategoryRequest req) {
        return ResponseEntity.ok(productService.createCategory(req));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        productService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ── Products ────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> listProducts(
        @RequestParam(required = false) UUID categoryId,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Boolean isActive,
        @RequestParam(defaultValue = "false") boolean lowStockOnly,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "name") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(productService.listProducts(
            categoryId, search, isActive, lowStockOnly, PageRequest.of(page, size, sort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductDTO> getByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(productService.getProductByBarcode(barcode));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
    public ResponseEntity<ProductDTO> createProduct(
        @Valid @RequestBody CreateProductRequest req,
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(productService.createProduct(req, user.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
    public ResponseEntity<ProductDTO> updateProduct(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateProductRequest req) {
        return ResponseEntity.ok(productService.updateProduct(id, req));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER','GYM_RECEPTIONIST')")
    public ResponseEntity<ProductDTO> adjustStock(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateStockRequest req,
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(productService.adjustStock(id, req, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
    public ResponseEntity<List<LowStockAlertDTO>> getLowStockAlerts() {
        return ResponseEntity.ok(productService.getLowStockAlerts());
    }
}
