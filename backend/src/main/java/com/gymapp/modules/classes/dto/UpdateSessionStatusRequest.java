package com.gymapp.modules.classes.dto;

import com.gymapp.modules.classes.SessionStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateSessionStatusRequest(
    @NotNull SessionStatus status,
    String notes,
    String cancelReason
) {}
