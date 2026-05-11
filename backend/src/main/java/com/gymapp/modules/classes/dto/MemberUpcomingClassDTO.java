package com.gymapp.modules.classes.dto;

import com.gymapp.modules.classes.BookingStatus;
import com.gymapp.modules.classes.ClassType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record MemberUpcomingClassDTO(
    UUID sessionId,
    UUID bookingId,
    String className,
    ClassType classType,
    String classColor,
    String trainerName,
    LocalDate sessionDate,
    LocalTime startTime,
    LocalTime endTime,
    String room,
    BookingStatus bookingStatus,
    long hoursUntilClass
) {}
