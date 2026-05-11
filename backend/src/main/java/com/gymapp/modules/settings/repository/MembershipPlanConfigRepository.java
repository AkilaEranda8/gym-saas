package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.MembershipPlanConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MembershipPlanConfigRepository extends JpaRepository<MembershipPlanConfig, UUID> {
    List<MembershipPlanConfig> findAllByGymIdAndIsActiveTrue(UUID gymId);
    Optional<MembershipPlanConfig> findByGymIdAndPlanName(UUID gymId, String planName);
    List<MembershipPlanConfig> findAllByGymIdOrderBySortOrder(UUID gymId);
}
