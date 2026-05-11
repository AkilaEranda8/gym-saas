package com.gymapp.modules.shop.controller;

import com.gymapp.modules.shop.dto.*;
import com.gymapp.modules.shop.service.PurchaseOrderService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/purchase-orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    public ResponseEntity<PurchaseOrderDTO> create(
        @Valid @RequestBody CreatePurchaseOrderRequest req) {
        return ResponseEntity.ok(purchaseOrderService.createPurchaseOrder(req));
    }

    @GetMapping
    public ResponseEntity<Page<PurchaseOrderDTO>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(purchaseOrderService.listPurchaseOrders(
            PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> get(@PathVariable UUID id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrder(id));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrderDTO> receive(
        @PathVariable UUID id,
        @Valid @RequestBody ReceivePurchaseOrderRequest req,
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(purchaseOrderService.receivePurchaseOrder(id, req, user.getUsername()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrderDTO> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(purchaseOrderService.cancelPurchaseOrder(id));
    }
}
