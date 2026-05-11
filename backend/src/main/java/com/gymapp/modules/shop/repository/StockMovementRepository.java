package com.gymapp.modules.shop.repository;

import com.gymapp.modules.shop.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    Page<StockMovement> findAllByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    List<StockMovement> findAllByGymIdAndCreatedAtBetween(UUID gymId, LocalDateTime from, LocalDateTime to);
}
