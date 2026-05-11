package com.gymapp.modules.member.dto;

import com.gymapp.modules.member.CheckInMethod;

import java.util.UUID;

public record CheckInRequest(
    String qrCode,
    UUID memberId,
    CheckInMethod method
) {}
