package com.gymapp.modules.trainer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, UUID> {

    @Query("SELECT t FROM Trainer t WHERE t.gymId = :gymId "
         + "AND (:status IS NULL OR t.status = :status) "
         + "AND (:branchId IS NULL OR t.branchId = :branchId)")
    Page<Trainer> findAllByGymIdWithFilters(
            @Param("gymId") UUID gymId,
            @Param("status") TrainerStatus status,
            @Param("branchId") UUID branchId,
            Pageable pageable);

    Optional<Trainer> findByIdAndGymId(UUID id, UUID gymId);

    long countByGymIdAndDeletedAtIsNull(UUID gymId);

    long countByGymIdAndStatus(UUID gymId, TrainerStatus status);

    Page<Trainer> findByGymIdAndStatus(UUID gymId, TrainerStatus status, Pageable pageable);

    boolean existsByGymIdAndEmail(UUID gymId, String email);

    boolean existsByGymIdAndPhone(UUID gymId, String phone);

    List<Trainer> findAllByGymIdAndStatus(UUID gymId, TrainerStatus status);
}
