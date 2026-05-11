package com.gymapp.modules.gym;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GymRepository extends JpaRepository<Gym, UUID> {

    boolean existsByOwnerEmail(String ownerEmail);
    boolean existsBySubdomain(String subdomain);
    Optional<Gym> findBySubdomain(String subdomain);
    Optional<Gym> findBySlug(String slug);
    Optional<Gym> findByOwnerUserId(String ownerUserId);
}
