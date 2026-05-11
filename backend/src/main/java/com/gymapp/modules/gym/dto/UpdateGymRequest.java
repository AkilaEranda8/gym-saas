package com.gymapp.modules.gym.dto;

import jakarta.validation.constraints.Size;

public record UpdateGymRequest(
    @Size(min = 2, max = 100) String name,
    @Size(max = 20)           String phone,
    @Size(max = 255)          String address,
    @Size(max = 500)          String logoUrl
) {}
