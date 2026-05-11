package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.enums.EquipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EquipmentRepository extends JpaRepository<Equipment, UUID> {

    @Query("""
        SELECT e FROM Equipment e
        WHERE e.gymId = :gymId
          AND (:categoryId IS NULL OR e.categoryId = :categoryId)
          AND (:status IS NULL OR e.status = :status)
          AND (:branchId IS NULL OR e.branchId = :branchId)
          AND (:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(e.brand) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(e.location) LIKE LOWER(CONCAT('%',:search,'%')))
        """)
    Page<Equipment> findAllByGymIdWithFilters(UUID gymId, UUID categoryId, EquipmentStatus status,
                                              UUID branchId, String search, Pageable pageable);

    Optional<Equipment> findByIdAndGymId(UUID id, UUID gymId);

    Optional<Equipment> findByQrCodeAndGymId(String qrCode, UUID gymId);

    Optional<Equipment> findBySerialNumberAndGymId(String serialNumber, UUID gymId);

    List<Equipment> findAllByGymIdAndStatus(UUID gymId, EquipmentStatus status);

    @Query("SELECT e FROM Equipment e WHERE e.gymId = :gymId AND e.nextServiceDate < :today AND e.status <> 'RETIRED'")
    List<Equipment> findServiceOverdue(UUID gymId, LocalDate today);

    @Query("SELECT e FROM Equipment e WHERE e.gymId = :gymId AND e.nextServiceDate BETWEEN :from AND :to AND e.status <> 'RETIRED'")
    List<Equipment> findServiceDueSoon(UUID gymId, LocalDate from, LocalDate to);

    @Query("SELECT e FROM Equipment e WHERE e.gymId = :gymId AND e.warrantyExpiry BETWEEN :today AND :cutoff")
    List<Equipment> findWarrantyExpiring(UUID gymId, LocalDate today, LocalDate cutoff);

    long countByGymIdAndStatus(UUID gymId, EquipmentStatus status);

    long countByGymIdAndDeletedAtIsNull(UUID gymId);

    @Modifying
    @Transactional
    @Query("UPDATE Equipment e SET e.deletedAt = :now WHERE e.id = :id AND e.gymId = :gymId")
    void softDelete(UUID id, UUID gymId, LocalDateTime now);

    @Query("""
        SELECT e FROM Equipment e
        WHERE e.gymId = :gymId
          AND e.nextServiceDate < :today
          AND e.status = 'OPERATIONAL'
          AND e.deletedAt IS NULL
        """)
    List<Equipment> findOverdueOperational(UUID gymId, LocalDate today);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.gymId = :gymId AND e.nextServiceDate < :today AND e.status <> 'RETIRED' AND e.deletedAt IS NULL")
    long countServiceOverdueByGymId(UUID gymId, LocalDate today);
}
