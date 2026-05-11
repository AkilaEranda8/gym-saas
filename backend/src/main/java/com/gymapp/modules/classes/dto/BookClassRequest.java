package com.gymapp.modules.classes.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record BookClassRequest(
    @NotNull UUID sessionId,
    UUID memberId
) {}
