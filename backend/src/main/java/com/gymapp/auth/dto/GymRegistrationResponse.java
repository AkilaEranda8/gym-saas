package com.gymapp.auth.dto;

import java.util.UUID;

public record GymRegistrationResponse(
    UUID gymId,
    String gymName,
    String gymSlug,
    String subdomain,
    String ownerEmail,
    String message
) {}
