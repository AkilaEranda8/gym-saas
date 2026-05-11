package com.gymapp.modules.classes.dto;

import com.gymapp.modules.classes.ClassDifficulty;
import com.gymapp.modules.classes.ClassType;
import jakarta.validation.constraints.*;

import java.util.UUID;

public record UpdateClassRequest(
    @Size(max = 100) String name,
    String description,
    ClassType type,
    UUID trainerId,
    UUID branchId,
    String room,
    @Min(1) @Max(200) Integer capacity,
    @Min(15) @Max(240) Integer durationMinutes,
    ClassDifficulty difficulty,
    Boolean isRecurring
) {}
