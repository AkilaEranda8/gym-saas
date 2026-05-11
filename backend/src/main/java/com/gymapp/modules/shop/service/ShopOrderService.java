package com.gymapp.modules.shop.service;

import com.gymapp.modules.shop.Product;
import com.gymapp.modules.shop.ShopOrder;
import com.gymapp.modules.shop.dto.*;
import com.gymapp.modules.shop.entity.OrderItem;
import com.gymapp.modules.shop.enums.OrderStatus;
import com.gymapp.modules.shop.enums.ShopPaymentStatus;
import com.gymapp.modules.shop.enums.StockMovementType;
import com.gymapp.modules.shop.enums.StockReferenceType;
import com.gymapp.modules.shop.repository.ProductRepository;
import com.gymapp.modules.shop.repository.ShopOrderRepository;
import com.gymapp.modules.shop.repository.StockMovementRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gymapp.modules.shop.entity.StockMovement;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ShopOrderService {

    private final ShopOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ReceiptPdfGenerator receiptPdfGenerator;

    private static final NumberFormat FMT;
    static {
        FMT = NumberFormat.getInstance(new Locale("en", "LK"));
        FMT.setGroupingUsed(true);
    }

    public String fmt(long lkr) { return "Rs. " + FMT.format(lkr); }

    // ── Create Order ────────────────────────────────────────────

    @Transactional
    public ShopOrderDTO createOrder(CreateOrderRequest req, String operatorName) {
        UUID gymId = TenantContext.getGymId();

        ShopOrder order = new ShopOrder();
        order.setGymId(gymId);
        order.setOrderNumber(generateOrderNumber(gymId));
        order.setPaymentMethod(req.paymentMethod());
        order.setPaymentStatus(ShopPaymentStatus.PAID);
        order.setStatus(OrderStatus.COMPLETED);
        order.setNotes(req.notes());
        order.setDiscountCode(req.discountCode());
        order.setCreatedBy(operatorName);
        if (req.memberId() != null) order.setMemberId(UUID.fromString(req.memberId()));

        long subtotal = 0L;
        List<OrderItem> items = new ArrayList<>();

        for (OrderItemRequest ir : req.items()) {
            Product product = productRepository.findByIdAndGymId(UUID.fromString(ir.productId()), gymId)
                .orElseThrow(() -> new NoSuchElementException("Product not found: " + ir.productId()));
            if (!product.getIsActive()) throw new IllegalStateException("Product inactive: " + product.getName());
            if (product.getStockQty() < ir.quantity())
                throw new IllegalStateException("Insufficient stock: " + product.getName());

            OrderItem item = new OrderItem();
            item.setGymId(gymId);
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setProductSku(product.getSku());
            item.setUnitPriceLkr(product.getPriceLkr());
            item.setQuantity(ir.quantity());
            item.setDiscountLkr(0L);
            long total = product.getPriceLkr() * ir.quantity();
            item.setTotalLkr(total);
            item.setOrder(order);
            items.add(item);
            subtotal += total;

            product.setStockQty(product.getStockQty() - ir.quantity());
            productRepository.save(product);
            recordMovement(gymId, product.getId(), ir.quantity(), StockMovementType.OUT,
                product.getStockQty() + ir.quantity(), product.getStockQty(),
                StockReferenceType.SALE, null, "Sale: " + order.getOrderNumber(), operatorName);
        }

        order.setItems(items);
        order.setSubtotalLkr(subtotal);
        order.setDiscountLkr(0L);
        order.setTaxLkr(0L);
        order.setTotalLkr(subtotal);
        order = orderRepository.save(order);

        try {
            byte[] pdf = receiptPdfGenerator.generate(order);
            order.setReceiptUrl("/api/v1/shop/orders/" + order.getId() + "/receipt");
            orderRepository.save(order);
        } catch (Exception ignored) {}

        return toDTO(order);
    }

    // ── List & Get ───────────────────────────────────────────────

    public Page<ShopOrderDTO> listOrders(UUID memberId, OrderStatus status,
                                          LocalDateTime from, LocalDateTime to, Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        return orderRepository.findAllByGymIdWithFilters(gymId, memberId, status, from, to, pageable)
            .map(this::toDTO);
    }

    public ShopOrderDTO getOrder(UUID id) {
        UUID gymId = TenantContext.getGymId();
        ShopOrder order = orderRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Order not found"));
        return toDTO(order);
    }

    public Page<MemberOrderHistoryDTO> getMemberOrderHistory(UUID memberId, Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        return orderRepository.findAllByGymIdWithFilters(gymId, memberId, null, null, null, pageable)
            .map(o -> new MemberOrderHistoryDTO(o.getId(), o.getOrderNumber(), o.getStatus(),
                o.getTotalLkr(), fmt(o.getTotalLkr()), o.getPaymentMethod(), o.getPaymentStatus(),
                o.getReceiptUrl(), o.getItems().stream().map(this::itemToDTO).toList(), o.getCreatedAt()));
    }

    // ── Refund ───────────────────────────────────────────────────

    @Transactional
    public ShopOrderDTO refundOrder(UUID id, RefundOrderRequest req, String operatorName) {
        UUID gymId = TenantContext.getGymId();
        ShopOrder order = orderRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Order not found"));
        if (order.getStatus() == OrderStatus.REFUNDED)
            throw new IllegalStateException("Order already refunded");
        if (order.getStatus() == OrderStatus.CANCELLED)
            throw new IllegalStateException("Cannot refund cancelled order");

        order.setStatus(OrderStatus.REFUNDED);
        order.setRefundReason(req.reason());
        order.setRefundedAt(LocalDateTime.now());

        if (req.restockItems()) {
            for (OrderItem item : order.getItems()) {
                productRepository.findByIdAndGymId(item.getProductId(), gymId).ifPresent(p -> {
                    int prevQty = p.getStockQty();
                    p.setStockQty(prevQty + item.getQuantity());
                    productRepository.save(p);
                    recordMovement(gymId, p.getId(), item.getQuantity(), StockMovementType.RETURN,
                        prevQty, p.getStockQty(), StockReferenceType.RETURN,
                        order.getId(), "Refund: " + order.getOrderNumber(), operatorName);
                });
            }
        }
        return toDTO(orderRepository.save(order));
    }

    // ── Receipt PDF ──────────────────────────────────────────────

    public byte[] generateReceipt(UUID id) throws Exception {
        UUID gymId = TenantContext.getGymId();
        ShopOrder order = orderRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Order not found"));
        return receiptPdfGenerator.generate(order);
    }

    // ── Helpers ──────────────────────────────────────────────────

    private String generateOrderNumber(UUID gymId) {
        int year = Year.now().getValue();
        long count = orderRepository.countByGymIdAndCreatedAtBetween(gymId,
            LocalDateTime.of(year, 1, 1, 0, 0),
            LocalDateTime.of(year, 12, 31, 23, 59, 59)) + 1;
        return String.format("ORD-%d-%05d", year, count);
    }

    private void recordMovement(UUID gymId, UUID productId, int qty, StockMovementType type,
                                 int prev, int newQty, StockReferenceType refType,
                                 UUID refId, String notes, String createdBy) {
        StockMovement sm = new StockMovement();
        sm.setGymId(gymId);
        sm.setProductId(productId);
        sm.setMovementType(type);
        sm.setQuantity(qty);
        sm.setPreviousStock(prev);
        sm.setNewStock(newQty);
        sm.setReferenceType(refType);
        sm.setReferenceId(refId);
        sm.setNotes(notes);
        sm.setCreatedBy(createdBy);
        stockMovementRepository.save(sm);
    }

    public ShopOrderDTO toDTO(ShopOrder o) {
        String memberName = null;
        String memberPhone = null;
        return new ShopOrderDTO(o.getId(), o.getGymId(), o.getMemberId(), memberName, memberPhone,
            o.getOrderNumber(), o.getStatus(), o.getSubtotalLkr(), o.getDiscountLkr(), o.getTaxLkr(),
            o.getTotalLkr(), fmt(o.getTotalLkr()), o.getPaymentMethod(), o.getPaymentStatus(),
            o.getDiscountCode(), o.getNotes(), o.getReceiptUrl(), o.getCreatedBy(),
            o.getRefundReason(), o.getRefundedAt(),
            o.getItems().stream().map(this::itemToDTO).toList(),
            o.getCreatedAt(), o.getUpdatedAt());
    }

    private OrderItemDTO itemToDTO(OrderItem i) {
        return new OrderItemDTO(i.getId(), i.getProductId(), i.getProductName(), i.getProductSku(),
            i.getUnitPriceLkr(), fmt(i.getUnitPriceLkr()),
            i.getQuantity(), i.getDiscountLkr(), i.getTotalLkr(), fmt(i.getTotalLkr()));
    }
}
