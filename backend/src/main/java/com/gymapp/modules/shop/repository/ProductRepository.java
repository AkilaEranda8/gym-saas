package com.gymapp.modules.shop.repository;

import com.gymapp.modules.shop.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findByIdAndGymId(UUID id, UUID gymId);

    Optional<Product> findByBarcodeAndGymId(String barcode, UUID gymId);

    Optional<Product> findBySkuAndGymId(String sku, UUID gymId);

    boolean existsBySkuAndGymId(String sku, UUID gymId);

    boolean existsByBarcodeAndGymId(String barcode, UUID gymId);

    List<Product> findAllByGymIdAndIsActiveTrueAndIsFeaturedTrue(UUID gymId);

    @Query("""
        SELECT p FROM Product p
        WHERE p.gymId = :gymId
          AND (:categoryId IS NULL OR p.categoryId = :categoryId)
          AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:isActive IS NULL OR p.isActive = :isActive)
          AND (:isLowStock = false OR (p.stockQty <= p.minStockQty AND p.stockQty > 0))
        """)
    Page<Product> findAllByGymIdWithFilters(
        @Param("gymId")       UUID gymId,
        @Param("categoryId")  UUID categoryId,
        @Param("search")      String search,
        @Param("isActive")    Boolean isActive,
        @Param("isLowStock")  boolean isLowStock,
        Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.gymId = :gymId AND p.stockQty <= p.minStockQty AND p.stockQty > 0")
    List<Product> findLowStockByGymId(@Param("gymId") UUID gymId);

    @Query("SELECT p FROM Product p WHERE p.gymId = :gymId AND p.stockQty = 0 AND p.isActive = true")
    List<Product> findOutOfStockByGymId(@Param("gymId") UUID gymId);
}
