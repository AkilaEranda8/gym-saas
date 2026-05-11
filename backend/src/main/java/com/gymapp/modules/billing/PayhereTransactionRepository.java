package com.gymapp.modules.billing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayhereTransactionRepository extends JpaRepository<PayhereTransaction, UUID> {

    Optional<PayhereTransaction> findByOrderId(String orderId);

    Page<PayhereTransaction> findAllByGymIdOrderByReceivedAtDesc(UUID gymId, Pageable pageable);
}
