package com.gymapp.modules.classes.dto;

import com.gymapp.modules.classes.BookingStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClassBookingDTO(
    UUID id,
    UUID sessionId,
    UUID memberId,
    String memberName,
    String memberPhone,
    BookingStatus status,
    LocalDateTime bookedAt,
    LocalDateTime cancelledAt,
    String cancelReason,
    Integer waitlistPosition,
    LocalDateTime attendedAt
) {}
