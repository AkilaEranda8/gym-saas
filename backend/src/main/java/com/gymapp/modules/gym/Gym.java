package com.gymapp.modules.gym;

import com.gymapp.multitenancy.BaseEntity;
import com.gymapp.shared.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "gyms")
public class Gym extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(nullable = false, unique = true, length = 100)
    private String subdomain;

    @Column(name = "owner_user_id", length = 100)
    private String ownerUserId;

    @Column(name = "owner_email", nullable = false, unique = true, length = 150)
    private String ownerEmail;

    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_status", nullable = false, length = 20)
    private SubscriptionStatus subscriptionStatus = SubscriptionStatus.TRIAL;

    @Column(name = "subscription_plan", length = 50)
    private String subscriptionPlan;

    @Column(nullable = false)
    private boolean active = true;
}
