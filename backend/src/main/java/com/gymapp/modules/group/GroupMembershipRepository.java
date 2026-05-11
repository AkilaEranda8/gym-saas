package com.gymapp.modules.group;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupMembershipRepository extends JpaRepository<MemberGroupMembership, UUID> {
    List<MemberGroupMembership> findAllByGroupId(UUID groupId);
    Optional<MemberGroupMembership> findByGroupIdAndMemberId(UUID groupId, UUID memberId);
    List<MemberGroupMembership> findAllByMemberId(UUID memberId);
    void deleteByGroupIdAndMemberId(UUID groupId, UUID memberId);
    long countByGroupId(UUID groupId);
}
