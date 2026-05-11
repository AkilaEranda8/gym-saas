package com.gymapp.modules.trainer.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TrainerScheduleDTO(
        UUID trainerId,
        String trainerName,
        LocalDate date,
        List<PTSessionDTO> sessions,
        boolean isAvailable,
        boolean isOnLeave
) {}
