package com.gymapp.modules.member.dto;

import com.gymapp.shared.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record MemberRequest(
    @NotBlank @Size(min = 1, max = 60) String firstName,
    @NotBlank @Size(min = 1, max = 60) String lastName,
    @NotBlank @Email                   String email,
    @Size(max = 20)                    String phone,
    LocalDate dateOfBirth,
    Gender gender,
    @Size(max = 255)                   String address,
    UUID branchId,
    @Size(max = 100)                   String emergencyContactName,
    @Size(max = 20)                    String emergencyContactPhone,
    String notes
) {}
