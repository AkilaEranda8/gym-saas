package com.gymapp.modules.trainer.dto;

import java.time.YearMonth;
import java.util.UUID;

public record TrainerMonthlyStatsDTO(
        UUID trainerId,
        String trainerName,
        YearMonth month,
        long completedSessions,
        long cancelledSessions,
        long noShowSessions,
        long activeClients,
        long newClientsThisMonth,
        double averageRating,
        long totalRevenueGenerated
) {}
