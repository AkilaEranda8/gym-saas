package com.gymapp.modules.trainer.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CertificationDTO(
        UUID id,
        UUID trainerId,
        String name,
        String issuingBody,
        LocalDate issuedDate,
        LocalDate expiryDate,
        String certificateUrl,
        boolean isVerified,
        boolean isExpired,
        long daysUntilExpiry
) {}
