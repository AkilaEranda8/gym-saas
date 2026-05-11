package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.HolidayConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HolidayConfigRepository extends JpaRepository<HolidayConfig, UUID> {
    List<HolidayConfig> findAllByGymIdAndHolidayDateGreaterThanEqualOrderByHolidayDateAsc(UUID gymId, LocalDate from);
    Optional<HolidayConfig> findByGymIdAndHolidayDate(UUID gymId, LocalDate date);
    List<HolidayConfig> findAllByGymIdAndIsRecurringTrue(UUID gymId);
    List<HolidayConfig> findAllByGymIdOrderByHolidayDateAsc(UUID gymId);
}
