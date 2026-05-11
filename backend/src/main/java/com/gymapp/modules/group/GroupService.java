package com.gymapp.modules.group;

import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final MemberGroupRepository    groupRepository;
    private final GroupMembershipRepository membershipRepository;

    public record GroupRequest(String name, String description, String color) {}

    public record GroupResponse(
        UUID id, UUID gymId, String name, String description,
        String color, boolean active, long memberCount
    ) {
        static GroupResponse from(MemberGroup g, long count) {
            return new GroupResponse(g.getId(), g.getGymId(), g.getName(),
                g.getDescription(), g.getColor(), g.isActive(), count);
        }
    }

    public record MemberIdRequest(UUID memberId) {}

    // ── List ──────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<GroupResponse> listGroups() {
        UUID gymId = TenantContext.getGymId();
        return groupRepository.findAllByGymIdAndActiveTrue(gymId).stream()
            .map(g -> GroupResponse.from(g, membershipRepository.countByGroupId(g.getId())))
            .toList();
    }

    // ── Create ────────────────────────────────────────────────
    @Transactional
    public GroupResponse createGroup(GroupRequest req) {
        UUID gymId = TenantContext.getGymId();
        if (groupRepository.existsByNameAndGymId(req.name(), gymId))
            throw new IllegalStateException("Group with this name already exists");
        MemberGroup g = new MemberGroup();
        g.setGymId(gymId);
        g.setName(req.name().trim());
        g.setDescription(req.description());
        g.setColor(req.color() != null ? req.color() : "#6366f1");
        g = groupRepository.save(g);
        return GroupResponse.from(g, 0);
    }

    // ── Update ────────────────────────────────────────────────
    @Transactional
    public GroupResponse updateGroup(UUID id, GroupRequest req) {
        UUID gymId = TenantContext.getGymId();
        MemberGroup g = groupRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Group not found"));
        g.setName(req.name().trim());
        g.setDescription(req.description());
        if (req.color() != null) g.setColor(req.color());
        g = groupRepository.save(g);
        return GroupResponse.from(g, membershipRepository.countByGroupId(g.getId()));
    }

    // ── Delete ────────────────────────────────────────────────
    @Transactional
    public void deleteGroup(UUID id) {
        UUID gymId = TenantContext.getGymId();
        MemberGroup g = groupRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Group not found"));
        g.setActive(false);
        groupRepository.save(g);
    }

    // ── Members ───────────────────────────────────────────────
    @Transactional
    public void addMember(UUID groupId, UUID memberId) {
        UUID gymId = TenantContext.getGymId();
        MemberGroup g = groupRepository.findByIdAndGymId(groupId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Group not found"));
        if (membershipRepository.findByGroupIdAndMemberId(groupId, memberId).isPresent())
            throw new IllegalStateException("Member already in group");
        MemberGroupMembership m = new MemberGroupMembership();
        m.setGroup(g);
        m.setMemberId(memberId);
        membershipRepository.save(m);
    }

    @Transactional
    public void removeMember(UUID groupId, UUID memberId) {
        UUID gymId = TenantContext.getGymId();
        groupRepository.findByIdAndGymId(groupId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Group not found"));
        membershipRepository.deleteByGroupIdAndMemberId(groupId, memberId);
    }

    @Transactional(readOnly = true)
    public List<UUID> getGroupMemberIds(UUID groupId) {
        UUID gymId = TenantContext.getGymId();
        groupRepository.findByIdAndGymId(groupId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Group not found"));
        return membershipRepository.findAllByGroupId(groupId).stream()
            .map(MemberGroupMembership::getMemberId).toList();
    }
}
