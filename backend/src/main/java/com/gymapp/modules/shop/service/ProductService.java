package com.gymapp.modules.shop.service;

import com.gymapp.modules.shop.Product;
import com.gymapp.modules.shop.dto.*;
import com.gymapp.modules.shop.entity.ProductCategory;
import com.gymapp.modules.shop.entity.StockMovement;
import com.gymapp.modules.shop.enums.StockMovementType;
import com.gymapp.modules.shop.enums.StockReferenceType;
import com.gymapp.modules.shop.repository.ProductCategoryRepository;
import com.gymapp.modules.shop.repository.ProductRepository;
import com.gymapp.modules.shop.repository.StockMovementRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final StockMovementRepository stockMovementRepository;

    private static final NumberFormat FMT;
    static {
        FMT = NumberFormat.getInstance(new Locale("en", "LK"));
        FMT.setGroupingUsed(true);
    }

    public String fmt(long lkr) {
        return "Rs. " + FMT.format(lkr);
    }

    // ── Categories ──────────────────────────────────────────────

    public List<ProductCategoryDTO> listCategories(boolean activeOnly) {
        UUID gymId = TenantContext.getGymId();
        List<ProductCategory> cats = activeOnly
            ? categoryRepository.findAllByGymIdAndIsActiveTrueOrderBySortOrderAsc(gymId)
            : categoryRepository.findAllByGymIdOrderBySortOrderAsc(gymId);
        return cats.stream().map(c -> {
            long count = productRepository.findAllByGymIdWithFilters(gymId, c.getId(), null, true, false, Pageable.unpaged()).getTotalElements();
            return new ProductCategoryDTO(c.getId(), c.getGymId(), c.getName(), c.getDescription(),
                c.getIcon(), c.getColor(), c.getSortOrder(), c.getIsActive(), count, c.getCreatedAt());
        }).toList();
    }

    @Transactional
    public ProductCategoryDTO createCategory(CreateCategoryRequest req) {
        UUID gymId = TenantContext.getGymId();
        if (categoryRepository.existsByGymIdAndName(gymId, req.name())) {
            throw new IllegalArgumentException("Category already exists: " + req.name());
        }
        ProductCategory cat = new ProductCategory();
        cat.setGymId(gymId);
        cat.setName(req.name());
        cat.setDescription(req.description());
        cat.setIcon(req.icon());
        cat.setColor(req.color());
        cat.setSortOrder(req.sortOrder());
        cat.setIsActive(true);
        cat = categoryRepository.save(cat);
        return new ProductCategoryDTO(cat.getId(), cat.getGymId(), cat.getName(), cat.getDescription(),
            cat.getIcon(), cat.getColor(), cat.getSortOrder(), cat.getIsActive(), 0, cat.getCreatedAt());
    }

    @Transactional
    public void deleteCategory(UUID id) {
        UUID gymId = TenantContext.getGymId();
        ProductCategory cat = categoryRepository.findById(id)
            .filter(c -> c.getGymId().equals(gymId))
            .orElseThrow(() -> new NoSuchElementException("Category not found"));
        cat.setDeletedAt(LocalDateTime.now());
        cat.setIsActive(false);
        categoryRepository.save(cat);
    }

    // ── Products ────────────────────────────────────────────────

    public Page<ProductDTO> listProducts(UUID categoryId, String search, Boolean isActive,
                                          boolean isLowStock, Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        return productRepository.findAllByGymIdWithFilters(gymId, categoryId, search, isActive, isLowStock, pageable)
            .map(this::toDTO);
    }

    public ProductDTO getProduct(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Product p = productRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Product not found"));
        return toDTO(p);
    }

    public ProductDTO getProductByBarcode(String barcode) {
        UUID gymId = TenantContext.getGymId();
        Product p = productRepository.findByBarcodeAndGymId(barcode, gymId)
            .orElseThrow(() -> new NoSuchElementException("Product not found for barcode: " + barcode));
        return toDTO(p);
    }

    @Transactional
    public ProductDTO createProduct(CreateProductRequest req, String createdBy) {
        UUID gymId = TenantContext.getGymId();
        if (req.sku() != null && productRepository.existsBySkuAndGymId(req.sku(), gymId)) {
            throw new IllegalArgumentException("SKU already exists: " + req.sku());
        }
        if (req.barcode() != null && productRepository.existsByBarcodeAndGymId(req.barcode(), gymId)) {
            throw new IllegalArgumentException("Barcode already exists: " + req.barcode());
        }
        Product p = new Product();
        p.setGymId(gymId);
        p.setName(req.name());
        p.setDescription(req.description());
        p.setBrand(req.brand());
        p.setCategoryId(req.categoryId() != null ? UUID.fromString(req.categoryId()) : null);
        p.setSku(req.sku());
        p.setBarcode(req.barcode());
        p.setUnit(req.unit());
        p.setPriceLkr(req.priceLkr());
        p.setCostPriceLkr(req.costPriceLkr());
        p.setStockQty(req.stockQty());
        p.setMinStockQty(req.minStockQty());
        p.setMaxStockQty(req.maxStockQty());
        p.setImageUrl(req.imageUrl());
        p.setIsActive(req.isActive());
        p.setIsFeatured(req.isFeatured());
        if (req.branchId() != null) p.setBranchId(UUID.fromString(req.branchId()));
        p = productRepository.save(p);

        if (req.stockQty() != null && req.stockQty() > 0) {
            recordMovement(p, req.stockQty(), StockMovementType.IN, 0, req.stockQty(),
                StockReferenceType.ADJUSTMENT, null, "Initial stock", createdBy);
        }
        return toDTO(p);
    }

    @Transactional
    public ProductDTO updateProduct(UUID id, UpdateProductRequest req) {
        UUID gymId = TenantContext.getGymId();
        Product p = productRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Product not found"));
        if (req.name() != null) p.setName(req.name());
        if (req.description() != null) p.setDescription(req.description());
        if (req.brand() != null) p.setBrand(req.brand());
        if (req.categoryId() != null) p.setCategoryId(UUID.fromString(req.categoryId()));
        if (req.sku() != null) p.setSku(req.sku());
        if (req.barcode() != null) p.setBarcode(req.barcode());
        if (req.unit() != null) p.setUnit(req.unit());
        if (req.priceLkr() != null) p.setPriceLkr(req.priceLkr());
        if (req.costPriceLkr() != null) p.setCostPriceLkr(req.costPriceLkr());
        if (req.minStockQty() != null) p.setMinStockQty(req.minStockQty());
        if (req.maxStockQty() != null) p.setMaxStockQty(req.maxStockQty());
        if (req.isActive() != null) p.setIsActive(req.isActive());
        if (req.isFeatured() != null) p.setIsFeatured(req.isFeatured());
        if (req.imageUrl() != null) p.setImageUrl(req.imageUrl());
        if (req.branchId() != null) p.setBranchId(UUID.fromString(req.branchId()));
        return toDTO(productRepository.save(p));
    }

    @Transactional
    public ProductDTO adjustStock(UUID id, UpdateStockRequest req, String operatorName) {
        UUID gymId = TenantContext.getGymId();
        Product p = productRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Product not found"));
        int prev = p.getStockQty();
        int newQty = switch (req.movementType()) {
            case IN -> prev + req.quantity();
            case OUT -> prev - req.quantity();
            case ADJUSTMENT -> req.quantity();
            case RETURN -> prev + req.quantity();
        };
        if (newQty < 0) throw new IllegalStateException("Insufficient stock");
        p.setStockQty(newQty);
        productRepository.save(p);
        recordMovement(p, req.quantity(), req.movementType(), prev, newQty,
            StockReferenceType.ADJUSTMENT, null, req.notes(), operatorName);
        return toDTO(p);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Product p = productRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Product not found"));
        p.setDeletedAt(LocalDateTime.now());
        p.setIsActive(false);
        productRepository.save(p);
    }

    public List<LowStockAlertDTO> getLowStockAlerts() {
        UUID gymId = TenantContext.getGymId();
        List<Product> products = productRepository.findLowStockByGymId(gymId);
        products.addAll(productRepository.findOutOfStockByGymId(gymId));
        return products.stream().map(p -> {
            String catName = p.getCategory() != null ? p.getCategory().getName() : null;
            String status = p.getStockQty() == 0 ? "OUT_OF_STOCK" : "LOW";
            return new LowStockAlertDTO(p.getId(), p.getName(), catName, p.getSku(),
                p.getStockQty(), p.getMinStockQty(), status);
        }).toList();
    }

    private void recordMovement(Product p, int qty, StockMovementType type, int prev, int newQty,
                                 StockReferenceType refType, UUID refId, String notes, String createdBy) {
        StockMovement sm = new StockMovement();
        sm.setGymId(p.getGymId());
        sm.setProductId(p.getId());
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

    public ProductDTO toDTO(Product p) {
        String catName = p.getCategory() != null ? p.getCategory().getName() : null;
        String status = p.getStockQty() == 0 ? "OUT_OF_STOCK"
            : p.isLowStock() ? "LOW" : "OK";
        return new ProductDTO(p.getId(), p.getGymId(), p.getCategoryId(), catName,
            p.getName(), p.getDescription(), p.getBrand(), p.getSku(), p.getBarcode(),
            p.getUnit(), p.getPriceLkr(), fmt(p.getPriceLkr()), p.getCostPriceLkr(),
            p.getStockQty(), p.getMinStockQty(), status,
            p.getImageUrl(), p.getIsActive(), p.getIsFeatured(),
            p.getCreatedAt(), p.getUpdatedAt());
    }
}
