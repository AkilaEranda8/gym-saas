package com.gymapp.modules.trainer.dto;

public record TrainerStatsDTO(
        long totalTrainers,
        long activeTrainers,
        long onLeaveToday,
        double averageRating,
        long totalActivePTClients,
        String topRatedTrainerName,
        double topRatedTrainerRating,
        String mostActiveTrainerName,
        long mostActiveTrainerSessions
) {}
