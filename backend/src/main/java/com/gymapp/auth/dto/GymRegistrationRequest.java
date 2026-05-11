package com.gymapp.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GymRegistrationRequest(

    @NotBlank(message = "Gym name is required")
    @Size(min = 2, max = 100, message = "Gym name must be 2–100 characters")
    String gymName,

    @NotBlank(message = "Owner name is required")
    @Size(min = 2, max = 100, message = "Owner name must be 2–100 characters")
    String ownerName,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password,

    String phone,
    String address
) {}
