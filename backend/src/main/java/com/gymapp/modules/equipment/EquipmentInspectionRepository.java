package com.gymapp.modules.equipment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EquipmentInspectionRepository extends JpaRepository<EquipmentInspection, UUID> {

    List<EquipmentInspection> findAllByEquipmentIdOrderByInspectionDateDesc(UUID equipmentId);

    @Query("SELECT i FROM EquipmentInspection i WHERE i.equipmentId = :equipmentId ORDER BY i.inspectionDate DESC")
    Optional<EquipmentInspection> findLatestByEquipmentId(UUID equipmentId);

    List<EquipmentInspection> findAllByGymIdAndInspectionDateBetween(UUID gymId, LocalDate from, LocalDate to);
}
