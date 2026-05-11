package com.gymapp.modules.classes.dto;

import com.gymapp.modules.classes.ClassDifficulty;
import com.gymapp.modules.classes.ClassType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.UUID;

public record CreateClassRequest(
    @NotBlank @Size(max = 100) String name,
    String description,
    @NotNull ClassType type,
    UUID trainerId,
    UUID branchId,
    String room,
    @NotNull @Min(1) @Max(200) Integer capacity,
    @NotNull @Min(15) @Max(240) Integer durationMinutes,
    ClassDifficulty difficulty,
    boolean isRecurring,
    @Valid List<CreateScheduleRequest> schedules
) {}
