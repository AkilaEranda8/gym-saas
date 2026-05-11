package com.gymapp.modules.trainer.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record AvailabilityDTO(
        UUID id,
        UUID trainerId,
        Integer dayOfWeek,
        String dayOfWeekName,
        LocalTime startTime,
        LocalTime endTime,
        boolean isAvailable
) {
    public static String toDayName(int day) {
        return DayOfWeek.of(day).name();
    }
}
