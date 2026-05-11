package com.gymapp.modules.member.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CheckInResponse(
    UUID memberId,
    String memberName,
    String planName,
    String status,
    LocalDateTime checkInTime,
    String message,
    boolean success
) {}
