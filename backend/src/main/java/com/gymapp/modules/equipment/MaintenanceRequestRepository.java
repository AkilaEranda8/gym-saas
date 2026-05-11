package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.enums.MaintenancePriority;
import com.gymapp.modules.equipment.enums.MaintenanceStatus;
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

public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, UUID> {

    @Query("""
        SELECT r FROM MaintenanceRequest r
        WHERE r.gymId = :gymId
          AND (:equipmentId IS NULL OR r.equipmentId = :equipmentId)
          AND (:status IS NULL OR r.status = :status)
          AND (:priority IS NULL OR r.priority = :priority)
          AND (:from IS NULL OR CAST(r.createdAt AS date) >= :from)
          AND (:to IS NULL OR CAST(r.createdAt AS date) <= :to)
        ORDER BY r.createdAt DESC
        """)
    Page<MaintenanceRequest> findAllByGymIdWithFilters(UUID gymId, UUID equipmentId,
                                                       MaintenanceStatus status,
                                                       MaintenancePriority priority,
                                                       LocalDate from, LocalDate to,
                                                       Pageable pageable);

    Optional<MaintenanceRequest> findByIdAndGymId(UUID id, UUID gymId);

    Optional<MaintenanceRequest> findByRequestNumberAndGymId(String requestNumber, UUID gymId);

    List<MaintenanceRequest> findAllByGymIdAndStatus(UUID gymId, MaintenanceStatus status);

    List<MaintenanceRequest> findAllByGymIdAndPriority(UUID gymId, MaintenancePriority priority);

    @Query("SELECT r FROM MaintenanceRequest r WHERE r.equipmentId = :equipmentId AND r.status IN ('OPEN','IN_PROGRESS')")
    List<MaintenanceRequest> findOpenByEquipmentId(UUID equipmentId);

    long countByGymIdAndStatus(UUID gymId, MaintenanceStatus status);

    long countByGymIdAndPriority(UUID gymId, MaintenancePriority priority);

    @Query("SELECT COUNT(r) FROM MaintenanceRequest r WHERE r.equipmentId = :equipmentId AND r.status IN ('OPEN','IN_PROGRESS')")
    long countOpenByEquipmentId(UUID equipmentId);

    @Query("SELECT COALESCE(SUM(r.actualCostLkr), 0) FROM MaintenanceRequest r WHERE r.gymId = :gymId AND r.resolvedAt BETWEEN :from AND :to")
    Long sumCostByGymIdAndResolvedAtBetween(UUID gymId, LocalDateTime from, LocalDateTime to);

    @Query(value = "SELECT COUNT(*) FROM maintenance_requests WHERE gym_id = :gymId AND EXTRACT(YEAR FROM created_at) = :year AND deleted_at IS NULL", nativeQuery = true)
    long countByGymIdAndYear(UUID gymId, int year);

    @Modifying
    @Transactional
    @Query("UPDATE MaintenanceRequest r SET r.deletedAt = :now WHERE r.id = :id AND r.gymId = :gymId")
    void softDelete(UUID id, UUID gymId, LocalDateTime now);

    @Query(value = "SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/86400), 0) FROM maintenance_requests WHERE gym_id = :gymId AND resolved_at BETWEEN :from AND :to AND deleted_at IS NULL", nativeQuery = true)
    Double avgResolutionDays(UUID gymId, LocalDateTime from, LocalDateTime to);
}
