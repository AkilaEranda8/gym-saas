package com.gymapp.modules.shop.repository;

import com.gymapp.modules.shop.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findAllByOrderId(UUID orderId);

    @Query("""
        SELECT oi.productId, oi.productName, SUM(oi.quantity) as totalQty,
               SUM(oi.totalLkr) as totalRev
        FROM OrderItem oi
        JOIN ShopOrder o ON o.id = oi.orderId
        WHERE oi.gymId = :gymId
          AND o.createdAt BETWEEN :from AND :to
          AND o.status = 'COMPLETED'
        GROUP BY oi.productId, oi.productName
        ORDER BY totalRev DESC
        """)
    List<Object[]> findTopProductsByGymId(
        @Param("gymId") UUID gymId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
}
