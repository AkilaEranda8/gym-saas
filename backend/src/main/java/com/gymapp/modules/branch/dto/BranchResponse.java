package com.gymapp.modules.branch.dto;

import com.gymapp.modules.branch.Branch;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record BranchResponse(
    UUID id,
    UUID gymId,
    String name,
    String address,
    String phone,
    String email,
    LocalTime openTime,
    LocalTime closeTime,
    String managerUserId,
    boolean active,
    LocalDateTime createdAt
) {
    public static BranchResponse from(Branch b) {
        return new BranchResponse(
            b.getId(), b.getGymId(), b.getName(), b.getAddress(),
            b.getPhone(), b.getEmail(), b.getOpenTime(), b.getCloseTime(),
            b.getManagerUserId(), b.isActive(), b.getCreatedAt()
        );
    }
}
