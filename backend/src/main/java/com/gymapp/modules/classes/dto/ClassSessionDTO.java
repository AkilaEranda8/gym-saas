package com.gymapp.modules.classes.dto;

import com.gymapp.modules.classes.BookingStatus;
import com.gymapp.modules.classes.ClassType;
import com.gymapp.modules.classes.SessionStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ClassSessionDTO(
    UUID id,
    UUID classId,
    UUID gymId,
    String className,
    ClassType classType,
    String classColor,
    String trainerName,
    String room,
    LocalDate sessionDate,
    LocalTime startTime,
    LocalTime endTime,
    int durationMinutes,
    int actualCapacity,
    int bookedCount,
    int availableSlots,
    long waitlistCount,
    SessionStatus status,
    int fillPercentage,
    boolean isFull,
    boolean isUserBooked,
    BookingStatus userBookingStatus
) {}
