package com.gymapp.modules.trainer.dto;

import com.gymapp.modules.trainer.AssignmentStatus;
import com.gymapp.modules.trainer.AssignmentType;

import java.time.LocalDate;
import java.util.UUID;

public record AssignmentDTO(
        UUID id,
        UUID trainerId,
        UUID memberId,
        String trainerName,
        String memberName,
        String memberPhone,
        AssignmentType assignmentType,
        AssignmentStatus status,
        LocalDate startedDate,
        LocalDate endedDate,
        Integer sessionsTotal,
        Integer sessionsUsed,
        Integer sessionsRemaining,
        int progressPercent,
        String notes
) {}
