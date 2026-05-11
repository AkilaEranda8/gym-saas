package com.gymapp.modules.classes;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FitnessClassRepository extends JpaRepository<FitnessClass, UUID> {

    Page<FitnessClass> findAllByGymId(UUID gymId, Pageable pageable);
    Optional<FitnessClass> findByIdAndGymId(UUID id, UUID gymId);
    long countByGymId(UUID gymId);

    @Query("""
        SELECT f FROM FitnessClass f
        WHERE f.gymId = :gymId
          AND (:type IS NULL OR f.type = :type)
          AND (:trainerId IS NULL OR f.trainerId = :trainerId)
          AND (:branchId IS NULL OR f.branchId = :branchId)
        """)
    Page<FitnessClass> findAllByGymIdWithFilters(
        UUID gymId, ClassType type, UUID trainerId, UUID branchId, Pageable pageable);

    @Query("SELECT COUNT(f) FROM FitnessClass f WHERE f.gymId = :gymId AND f.deletedAt IS NULL")
    long countByGymIdAndDeletedAtIsNull(UUID gymId);
}
