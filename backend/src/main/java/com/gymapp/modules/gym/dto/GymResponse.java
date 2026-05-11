package com.gymapp.modules.gym.dto;

import com.gymapp.modules.gym.Gym;
import com.gymapp.shared.enums.SubscriptionStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record GymResponse(
    UUID id,
    String name,
    String slug,
    String subdomain,
    String ownerEmail,
    String ownerName,
    String phone,
    String address,
    String logoUrl,
    SubscriptionStatus subscriptionStatus,
    String subscriptionPlan,
    boolean active,
    LocalDateTime createdAt
) {
    public static GymResponse from(Gym gym) {
        return new GymResponse(
            gym.getId(),
            gym.getName(),
            gym.getSlug(),
            gym.getSubdomain(),
            gym.getOwnerEmail(),
            gym.getOwnerName(),
            gym.getPhone(),
            gym.getAddress(),
            gym.getLogoUrl(),
            gym.getSubscriptionStatus(),
            gym.getSubscriptionPlan(),
            gym.isActive(),
            gym.getCreatedAt()
        );
    }
}
