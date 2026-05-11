package com.gymapp.modules.shop.service;

import com.gymapp.modules.shop.Product;
import com.gymapp.modules.shop.dto.*;
import com.gymapp.modules.shop.entity.PurchaseOrder;
import com.gymapp.modules.shop.entity.PurchaseOrderItem;
import com.gymapp.modules.shop.enums.PurchaseOrderStatus;
import com.gymapp.modules.shop.enums.StockMovementType;
import com.gymapp.modules.shop.enums.StockReferenceType;
import com.gymapp.modules.shop.entity.StockMovement;
import com.gymapp.modules.shop.repository.ProductRepository;
import com.gymapp.modules.shop.repository.PurchaseOrderRepository;
import com.gymapp.modules.shop.repository.StockMovementRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    private static final NumberFormat FMT;
    static {
        FMT = NumberFormat.getInstance(new Locale("en", "LK"));
        FMT.setGroupingUsed(true);
    }

    public String fmt(long lkr) { return "Rs. " + FMT.format(lkr); }

    @Transactional
    public PurchaseOrderDTO createPurchaseOrder(CreatePurchaseOrderRequest req) {
        UUID gymId = TenantContext.getGymId();
        PurchaseOrder po = new PurchaseOrder();
        po.setGymId(gymId);
        po.setPoNumber(generatePoNumber(gymId));
        po.setSupplierName(req.supplierName());
        po.setSupplierPhone(req.supplierPhone());
        po.setNotes(req.notes());
        po.setStatus(PurchaseOrderStatus.PENDING);
        if (req.branchId() != null) po.setBranchId(UUID.fromString(req.branchId()));

        po.setTotalLkr(0L);
        po = poRepository.save(po);

        long total = 0L;
        List<PurchaseOrderItem> items = new ArrayList<>();
        for (POItemRequest ir : req.items()) {
            Product p = productRepository.findByIdAndGymId(UUID.fromString(ir.productId()), gymId)
                .orElseThrow(() -> new NoSuchElementException("Product not found: " + ir.productId()));
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setGymId(gymId);
            item.setPoId(po.getId());
            item.setProductId(p.getId());
            item.setQuantityOrdered(ir.quantityOrdered());
            item.setQuantityReceived(0);
            item.setUnitCostLkr(ir.unitCostLkr());
            long itemTotal = ir.unitCostLkr() * ir.quantityOrdered();
            item.setTotalCostLkr(itemTotal);
            item.setPurchaseOrder(po);
            items.add(item);
            total += itemTotal;
        }
        po.setItems(items);
        po.setTotalLkr(total);
        po = poRepository.save(po);
        return toDTO(po);
    }

    public Page<PurchaseOrderDTO> listPurchaseOrders(Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        return poRepository.findAllByGymId(gymId, pageable).map(this::toDTO);
    }

    public PurchaseOrderDTO getPurchaseOrder(UUID id) {
        UUID gymId = TenantContext.getGymId();
        return toDTO(poRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Purchase order not found")));
    }

    @Transactional
    public PurchaseOrderDTO receivePurchaseOrder(UUID id, ReceivePurchaseOrderRequest req, String operatorName) {
        UUID gymId = TenantContext.getGymId();
        PurchaseOrder po = poRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Purchase order not found"));
        if (po.getStatus() == PurchaseOrderStatus.CANCELLED)
            throw new IllegalStateException("Cannot receive cancelled PO");
        if (po.getStatus() == PurchaseOrderStatus.RECEIVED)
            throw new IllegalStateException("PO already received");

        Map<UUID, Integer> receivedMap = new HashMap<>();
        for (ReceiveItemRequest r : req.items()) {
            receivedMap.put(UUID.fromString(r.poItemId()), r.quantityReceived());
        }

        for (PurchaseOrderItem item : po.getItems()) {
            Integer received = receivedMap.get(item.getId());
            if (received != null && received > 0) {
                item.setQuantityReceived(received);
                productRepository.findByIdAndGymId(item.getProductId(), gymId).ifPresent(p -> {
                    int prev = p.getStockQty();
                    p.setStockQty(prev + received);
                    productRepository.save(p);
                    StockMovement sm = new StockMovement();
                    sm.setGymId(gymId);
                    sm.setProductId(p.getId());
                    sm.setMovementType(StockMovementType.IN);
                    sm.setQuantity(received);
                    sm.setPreviousStock(prev);
                    sm.setNewStock(p.getStockQty());
                    sm.setReferenceType(StockReferenceType.PURCHASE);
                    sm.setReferenceId(po.getId());
                    sm.setNotes("Received PO: " + po.getPoNumber());
                    sm.setCreatedBy(operatorName);
                    stockMovementRepository.save(sm);
                });
            }
        }

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setReceivedAt(LocalDateTime.now());
        if (req.notes() != null) po.setNotes(req.notes());
        return toDTO(poRepository.save(po));
    }

    @Transactional
    public PurchaseOrderDTO cancelPurchaseOrder(UUID id) {
        UUID gymId = TenantContext.getGymId();
        PurchaseOrder po = poRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Purchase order not found"));
        if (po.getStatus() != PurchaseOrderStatus.PENDING)
            throw new IllegalStateException("Only PENDING orders can be cancelled");
        po.setStatus(PurchaseOrderStatus.CANCELLED);
        return toDTO(poRepository.save(po));
    }

    private String generatePoNumber(UUID gymId) {
        int year = Year.now().getValue();
        long count = poRepository.countByGymIdAndStatus(gymId, PurchaseOrderStatus.PENDING)
            + poRepository.countByGymIdAndStatus(gymId, PurchaseOrderStatus.RECEIVED) + 1;
        return String.format("PO-%d-%05d", year, count);
    }

    public PurchaseOrderDTO toDTO(PurchaseOrder po) {
        List<POItemDTO> items = po.getItems().stream().map(i -> {
            String productName = productRepository.findById(i.getProductId())
                .map(Product::getName).orElse("Unknown");
            String sku = productRepository.findById(i.getProductId())
                .map(Product::getSku).orElse(null);
            return new POItemDTO(i.getId(), i.getProductId(), productName, sku,
                i.getQuantityOrdered(), i.getQuantityReceived(),
                i.getUnitCostLkr(), fmt(i.getUnitCostLkr()),
                i.getTotalCostLkr(), fmt(i.getTotalCostLkr()));
        }).toList();
        return new PurchaseOrderDTO(po.getId(), po.getGymId(), po.getPoNumber(),
            po.getSupplierName(), po.getSupplierPhone(), po.getStatus(),
            po.getTotalLkr(), fmt(po.getTotalLkr()), po.getNotes(), items,
            po.getOrderedAt(), po.getReceivedAt(), po.getCreatedAt());
    }
}
