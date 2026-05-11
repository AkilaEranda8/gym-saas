package com.gymapp.modules.billing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByPaymentId(UUID paymentId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Page<Invoice> findAllByGymIdAndIssuedAtBetween(
            UUID gymId, LocalDateTime from, LocalDateTime to, Pageable pageable);

    List<Invoice> findAllByGymId(UUID gymId);
}
