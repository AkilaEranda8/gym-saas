package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.AuditSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuditSettingsRepository extends JpaRepository<AuditSettings, UUID> {
    Optional<AuditSettings> findByGymId(UUID gymId);
    boolean existsByGymId(UUID gymId);
}
