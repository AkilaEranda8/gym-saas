package com.gymapp.modules.shop.controller;

import com.gymapp.modules.shop.dto.*;
import com.gymapp.modules.shop.enums.OrderStatus;
import com.gymapp.modules.shop.service.ShopOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/orders")
@RequiredArgsConstructor
public class ShopOrderController {

    private final ShopOrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER','GYM_RECEPTIONIST')")
    public ResponseEntity<ShopOrderDTO> createOrder(
        @Valid @RequestBody CreateOrderRequest req,
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.createOrder(req, user.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER','GYM_RECEPTIONIST')")
    public ResponseEntity<Page<ShopOrderDTO>> listOrders(
        @RequestParam(required = false) UUID memberId,
        @RequestParam(required = false) OrderStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.listOrders(memberId, status, from, to,
            PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER','GYM_RECEPTIONIST')")
    public ResponseEntity<ShopOrderDTO> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrder(id));
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('GYM_ADMIN','GYM_MANAGER')")
    public ResponseEntity<ShopOrderDTO> refundOrder(
        @PathVariable UUID id,
        @Valid @RequestBody RefundOrderRequest req,
        @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(orderService.refundOrder(id, req, user.getUsername()));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<byte[]> getReceipt(@PathVariable UUID id) throws Exception {
        byte[] pdf = orderService.generateReceipt(id);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"receipt-" + id + ".pdf\"")
            .body(pdf);
    }

    @GetMapping("/member/{memberId}/history")
    public ResponseEntity<Page<MemberOrderHistoryDTO>> getMemberHistory(
        @PathVariable UUID memberId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getMemberOrderHistory(memberId,
            PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}
