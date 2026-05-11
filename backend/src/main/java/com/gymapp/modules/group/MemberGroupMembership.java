package com.gymapp.modules.group;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "member_group_memberships",
       uniqueConstraints = @UniqueConstraint(columnNames = {"group_id", "member_id"}))
public class MemberGroupMembership {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private MemberGroup group;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();
}
