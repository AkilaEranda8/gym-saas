package com.gymapp.modules.trainer.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record AddCertificationRequest(
        @NotBlank String name,
        String issuingBody,
        LocalDate issuedDate,
        LocalDate expiryDate,
        String certificateUrl
) {}
