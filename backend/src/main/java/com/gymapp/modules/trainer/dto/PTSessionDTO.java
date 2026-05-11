package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.PTSessionStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record PTSessionDTO(
        UUID id,
        UUID trainerId,
        UUID memberId,
        UUID assignmentId,
        String trainerName,
        String memberName,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        long durationMinutes,
        PTSessionStatus status,
        String notes,
        String memberFeedback,
        String trainerNotes
) {}
