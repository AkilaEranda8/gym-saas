package com.gymapp.modules.shop.controller;

import com.gymapp.modules.shop.dto.*;
import com.gymapp.modules.shop.service.ShopAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shop/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
public class ShopAnalyticsController {

    private final ShopAnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<ShopSummaryDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<TopProductDTO>> getTopProducts(
        @RequestParam(defaultValue = "30") int days,
        @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopProducts(days, limit));
    }

    @GetMapping("/daily-sales")
    public ResponseEntity<List<DailySalesDTO>> getDailySales(
        @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getDailySales(days));
    }
}
