package com.gymapp.modules.shop.repository;

import com.gymapp.modules.shop.entity.PurchaseOrder;
import com.gymapp.modules.shop.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    Page<PurchaseOrder> findAllByGymId(UUID gymId, Pageable pageable);

    List<PurchaseOrder> findAllByGymIdAndStatus(UUID gymId, PurchaseOrderStatus status);

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    Optional<PurchaseOrder> findByIdAndGymId(UUID id, UUID gymId);

    long countByGymIdAndStatus(UUID gymId, PurchaseOrderStatus status);
}
