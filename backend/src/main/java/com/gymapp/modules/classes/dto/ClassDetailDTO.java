package com.gymapp.modules.classes.dto;

import com.gymapp.modules.classes.ClassDifficulty;
import com.gymapp.modules.classes.ClassType;

import java.util.List;
import java.util.UUID;

public record ClassDetailDTO(
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
    List<ClassScheduleDTO> schedules,
    List<ClassSessionDTO> upcomingSessions,
    long totalBookingsAllTime,
    double averageAttendanceRate
) {}
