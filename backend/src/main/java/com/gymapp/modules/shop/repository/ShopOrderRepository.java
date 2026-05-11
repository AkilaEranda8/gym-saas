package com.gymapp.modules.shop.repository;

import com.gymapp.modules.shop.ShopOrder;
import com.gymapp.modules.shop.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, UUID> {

    Optional<ShopOrder> findByIdAndGymId(UUID id, UUID gymId);

    Optional<ShopOrder> findByOrderNumberAndGymId(String orderNumber, UUID gymId);

    @Query("""
        SELECT o FROM ShopOrder o
        WHERE o.gymId = :gymId
          AND (:memberId IS NULL OR o.memberId = :memberId)
          AND (:status IS NULL OR o.status = :status)
          AND (:from IS NULL OR o.createdAt >= :from)
          AND (:to IS NULL OR o.createdAt <= :to)
        ORDER BY o.createdAt DESC
        """)
    Page<ShopOrder> findAllByGymIdWithFilters(
        @Param("gymId")    UUID gymId,
        @Param("memberId") UUID memberId,
        @Param("status")   OrderStatus status,
        @Param("from")     LocalDateTime from,
        @Param("to")       LocalDateTime to,
        Pageable pageable
    );

    @Query("""
        SELECT COALESCE(SUM(o.totalLkr), 0)
        FROM ShopOrder o
        WHERE o.gymId = :gymId
          AND o.status = 'COMPLETED'
          AND o.createdAt BETWEEN :from AND :to
        """)
    Long sumRevenueByGymIdAndCreatedAtBetween(
        @Param("gymId") UUID gymId,
        @Param("from")  LocalDateTime from,
        @Param("to")    LocalDateTime to
    );

    @Query("""
        SELECT COUNT(o) FROM ShopOrder o
        WHERE o.gymId = :gymId
          AND o.status = 'COMPLETED'
          AND o.createdAt BETWEEN :from AND :to
        """)
    Long countByGymIdAndCreatedAtBetween(
        @Param("gymId") UUID gymId,
        @Param("from")  LocalDateTime from,
        @Param("to")    LocalDateTime to
    );

    @Query(value = """
        SELECT oi.product_id, oi.product_name, pc.name as category_name,
               SUM(oi.quantity) as qty_sold, SUM(oi.total_lkr) as revenue
        FROM order_items oi
        JOIN shop_orders o ON o.id = oi.order_id
        LEFT JOIN products p ON p.id = oi.product_id
        LEFT JOIN product_categories pc ON pc.id = p.category_id
        WHERE oi.gym_id = :gymId
          AND o.status = 'COMPLETED'
          AND o.created_at BETWEEN :from AND :to
        GROUP BY oi.product_id, oi.product_name, pc.name
        ORDER BY revenue DESC
        LIMIT :lim
        """, nativeQuery = true)
    List<Object[]> getTopSellingProducts(
        @Param("gymId") UUID gymId,
        @Param("from")  LocalDateTime from,
        @Param("to")    LocalDateTime to,
        @Param("lim")   int lim
    );

    @Query("""
        SELECT COALESCE(SUM(o.totalLkr), 0)
        FROM ShopOrder o
        WHERE o.gymId = :gymId
          AND o.status = 'COMPLETED'
          AND o.createdAt BETWEEN :from AND :to
        """)
    Long sumRevenueBetween(
        @Param("gymId") UUID gymId,
        @Param("from")  LocalDateTime from,
        @Param("to")    LocalDateTime to
    );

    @Query(value = """
        SELECT DATE(created_at) as sale_date,
               COUNT(*) as order_count,
               SUM(total_lkr) as revenue,
               SUM((SELECT SUM(oi2.quantity) FROM order_items oi2 WHERE oi2.order_id = o.id)) as items_sold
        FROM shop_orders o
        WHERE gym_id = :gymId
          AND status = 'COMPLETED'
          AND created_at BETWEEN :from AND :to
        GROUP BY DATE(created_at)
        ORDER BY sale_date ASC
        """, nativeQuery = true)
    List<Object[]> getDailySales(
        @Param("gymId") UUID gymId,
        @Param("from")  LocalDateTime from,
        @Param("to")    LocalDateTime to
    );
}
