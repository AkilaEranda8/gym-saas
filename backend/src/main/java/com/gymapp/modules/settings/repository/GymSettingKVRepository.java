package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.GymSettingKV;
import com.gymapp.modules.settings.enums.SettingCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GymSettingKVRepository extends JpaRepository<GymSettingKV, UUID> {
    Optional<GymSettingKV> findByGymIdAndKey(UUID gymId, String key);
    List<GymSettingKV> findAllByGymId(UUID gymId);
    List<GymSettingKV> findAllByGymIdAndCategory(UUID gymId, SettingCategory category);
    List<GymSettingKV> findByGymIdAndKeyIn(UUID gymId, Collection<String> keys);
}
