package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.PTSessionStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateSessionStatusRequest(
        @NotNull PTSessionStatus status,
        String trainerNotes,
        String memberFeedback
) {}
