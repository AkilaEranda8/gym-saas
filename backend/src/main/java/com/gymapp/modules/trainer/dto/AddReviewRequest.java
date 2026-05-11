package com.gymapp.modules.trainer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddReviewRequest(
        @NotNull @Min(1) @Max(5) Integer rating,
        String reviewText,
        boolean isAnonymous
) {}
