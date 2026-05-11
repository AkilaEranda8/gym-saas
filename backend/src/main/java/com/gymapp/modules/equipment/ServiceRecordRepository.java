package com.gymapp.modules.equipment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, UUID> {

    Page<ServiceRecord> findAllByEquipmentIdOrderByServiceDateDesc(UUID equipmentId, Pageable pageable);

    List<ServiceRecord> findAllByGymIdAndServiceDateBetween(UUID gymId, LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(r.costLkr), 0) FROM ServiceRecord r WHERE r.equipmentId = :equipmentId")
    Long sumCostByEquipmentId(UUID equipmentId);

    @Query("SELECT COALESCE(SUM(r.costLkr), 0) FROM ServiceRecord r WHERE r.gymId = :gymId AND r.serviceDate BETWEEN :from AND :to")
    Long sumCostByGymIdAndServiceDateBetween(UUID gymId, LocalDate from, LocalDate to);

    Optional<ServiceRecord> findByIdAndGymId(UUID id, UUID gymId);

    List<ServiceRecord> findTop5ByEquipmentIdOrderByServiceDateDesc(UUID equipmentId);
}
