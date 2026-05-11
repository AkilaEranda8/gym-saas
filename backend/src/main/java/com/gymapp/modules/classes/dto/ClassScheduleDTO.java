package com.gymapp.modules.classes.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ClassScheduleDTO(
    UUID id,
    UUID classId,
    int dayOfWeek,
    String dayOfWeekName,
    LocalTime startTime,
    LocalTime endTime,
    int maxCapacity,
    boolean isActive,
    LocalDate effectiveFrom,
    LocalDate effectiveUntil
) {
    public static String toDayName(int dow) {
        return DayOfWeek.of(dow).name();
    }
}
