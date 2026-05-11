package com.gymapp.modules.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlanRepository extends JpaRepository<Plan, UUID> {

    List<Plan> findAllByGymIdAndActiveTrue(UUID gymId);
    List<Plan> findAllByGymId(UUID gymId);
    Optional<Plan> findByIdAndGymId(UUID id, UUID gymId);
    boolean existsByNameAndGymId(String name, UUID gymId);
}
