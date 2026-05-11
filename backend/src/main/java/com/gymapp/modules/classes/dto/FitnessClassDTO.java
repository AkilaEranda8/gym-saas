package com.gymapp.modules.classes.dto;

import com.gymapp.modules.classes.ClassDifficulty;
import com.gymapp.modules.classes.ClassType;

import java.util.UUID;

public record FitnessClassDTO(
    UUID id,
    UUID gymId,
    UUID branchId,
    UUID trainerId,
    String trainerName,
    String name,
    String description,
    ClassType type,
    String room,
    int capacity,
    int durationMinutes,
    ClassDifficulty difficulty,
    String color,
    boolean isRecurring,
    long schedulesCount,
    long activeSchedules
) {}
