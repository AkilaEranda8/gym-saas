package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.IntegrationSetting;
import com.gymapp.modules.settings.enums.IntegrationProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IntegrationSettingRepository extends JpaRepository<IntegrationSetting, UUID> {
    Optional<IntegrationSetting> findByGymIdAndProvider(UUID gymId, IntegrationProvider provider);
    List<IntegrationSetting> findAllByGymId(UUID gymId);
    List<IntegrationSetting> findAllByGymIdAndIsEnabledTrue(UUID gymId);
}
