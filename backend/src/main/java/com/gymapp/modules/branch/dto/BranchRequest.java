package com.gymapp.modules.branch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalTime;

public record BranchRequest(
    @NotBlank @Size(min = 2, max = 100) String name,
    @Size(max = 255)                    String address,
    @Size(max = 20)                     String phone,
    @Size(max = 150)                    String email,
    LocalTime openTime,
    LocalTime closeTime,
    String managerUserId
) {}
