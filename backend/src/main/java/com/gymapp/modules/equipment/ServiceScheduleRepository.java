package com.gymapp.modules.equipment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ServiceScheduleRepository extends JpaRepository<ServiceSchedule, UUID> {

    List<ServiceSchedule> findAllByEquipmentIdAndIsActiveTrue(UUID equipmentId);

    List<ServiceSchedule> findAllByGymIdAndNextServiceDateBetween(UUID gymId, LocalDate from, LocalDate to);

    List<ServiceSchedule> findAllByGymIdAndIsActiveTrue(UUID gymId);

    Optional<ServiceSchedule> findByIdAndGymId(UUID id, UUID gymId);

    @Query("SELECT s FROM ServiceSchedule s WHERE s.equipmentId = :equipmentId AND s.isActive = true ORDER BY s.nextServiceDate ASC")
    List<ServiceSchedule> findActiveByEquipmentIdOrderByDate(UUID equipmentId);
}
