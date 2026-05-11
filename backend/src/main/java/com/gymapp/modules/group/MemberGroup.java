package com.gymapp.modules.group;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "member_groups")
public class MemberGroup extends TenantEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 20)
    private String color = "#6366f1";

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MemberGroupMembership> memberships = new ArrayList<>();
}
