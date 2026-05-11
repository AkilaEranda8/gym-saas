package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.OperatingHoursConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OperatingHoursRepository extends JpaRepository<OperatingHoursConfig, UUID> {
    List<OperatingHoursConfig> findAllByGymIdAndBranchIdIsNull(UUID gymId);
    List<OperatingHoursConfig> findAllByGymIdAndBranchId(UUID gymId, UUID branchId);
    Optional<OperatingHoursConfig> findByGymIdAndBranchIdIsNullAndDayOfWeek(UUID gymId, Integer dayOfWeek);
    Optional<OperatingHoursConfig> findByGymIdAndBranchIdAndDayOfWeek(UUID gymId, UUID branchId, Integer dayOfWeek);
    void deleteAllByGymIdAndBranchIdIsNull(UUID gymId);
    void deleteAllByGymIdAndBranchId(UUID gymId, UUID branchId);
}
