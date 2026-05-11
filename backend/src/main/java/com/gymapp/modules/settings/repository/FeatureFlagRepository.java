package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.FeatureFlag;
import com.gymapp.modules.settings.enums.FeatureKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, UUID> {
    Optional<FeatureFlag> findByGymIdAndFeatureKey(UUID gymId, FeatureKey featureKey);
    List<FeatureFlag> findAllByGymId(UUID gymId);
    List<FeatureFlag> findAllByGymIdAndIsEnabledTrue(UUID gymId);
}
