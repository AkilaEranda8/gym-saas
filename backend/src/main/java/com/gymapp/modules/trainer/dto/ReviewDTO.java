package com.gymapp.modules.trainer.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewDTO(
        UUID id,
        UUID trainerId,
        UUID memberId,
        String reviewerName,
        Integer rating,
        String reviewText,
        LocalDateTime createdAt,
        String starDisplay
) {
    public static String buildStarDisplay(int rating) {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    }
}
