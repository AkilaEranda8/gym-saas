package com.gymapp.modules.billing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, UUID> {

    Optional<Discount> findByGymIdAndCodeAndIsActiveTrue(UUID gymId, String code);

    List<Discount> findAllByGymIdAndIsActiveTrue(UUID gymId);

    Page<Discount> findAllByGymId(UUID gymId, Pageable pageable);

    Optional<Discount> findByIdAndGymId(UUID id, UUID gymId);

    boolean existsByGymIdAndCode(UUID gymId, String code);
}
