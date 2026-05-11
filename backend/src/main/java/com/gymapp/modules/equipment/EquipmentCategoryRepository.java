package com.gymapp.modules.equipment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EquipmentCategoryRepository extends JpaRepository<EquipmentCategory, UUID> {

    List<EquipmentCategory> findAllByGymIdOrderByNameAsc(UUID gymId);

    Optional<EquipmentCategory> findByIdAndGymId(UUID id, UUID gymId);

    boolean existsByGymIdAndNameIgnoreCase(UUID gymId, String name);

    @Modifying
    @Transactional
    @Query("UPDATE EquipmentCategory c SET c.deletedAt = :now WHERE c.id = :id AND c.gymId = :gymId")
    void softDelete(UUID id, UUID gymId, LocalDateTime now);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.categoryId = :categoryId AND e.deletedAt IS NULL")
    long countEquipmentByCategory(UUID categoryId);
}
