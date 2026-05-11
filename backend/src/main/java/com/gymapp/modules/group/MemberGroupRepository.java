package com.gymapp.modules.group;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberGroupRepository extends JpaRepository<MemberGroup, UUID> {
    List<MemberGroup>    findAllByGymIdAndActiveTrue(UUID gymId);
    Optional<MemberGroup> findByIdAndGymId(UUID id, UUID gymId);
    boolean              existsByNameAndGymId(String name, UUID gymId);
}
