package com.gymapp.modules.equipment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface EquipmentUsageLogRepository extends JpaRepository<EquipmentUsageLog, UUID> {

    List<EquipmentUsageLog> findAllByEquipmentIdAndUsageDateBetween(UUID equipmentId, LocalDate from, LocalDate to);

    @Query("SELECT COUNT(u) FROM EquipmentUsageLog u WHERE u.equipmentId = :equipmentId AND u.usageDate BETWEEN :from AND :to")
    long countUsageByEquipmentIdAndDateRange(UUID equipmentId, LocalDate from, LocalDate to);

    @Query(value = """
        SELECT e.id, e.name, COUNT(u.id) as usage_count
        FROM equipment e
        JOIN equipment_usage_logs u ON e.id = u.equipment_id
        WHERE e.gym_id = :gymId AND u.usage_date BETWEEN :from AND :to
        GROUP BY e.id, e.name
        ORDER BY usage_count DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> getMostUsedEquipment(UUID gymId, LocalDate from, LocalDate to, int limit);
}
