package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.GymSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GymSettingsRepository extends JpaRepository<GymSettings, UUID> {
    Optional<GymSettings> findByGymId(UUID gymId);
    boolean existsByGymId(UUID gymId);
}
