package com.gymapp.modules.classes.dto;

public record ClassStatsDTO(
    long totalClasses,
    long totalSessionsThisMonth,
    long totalBookingsThisMonth,
    double averageFillRate,
    String mostPopularClass,
    String mostActiveTrainer,
    long cancelledSessionsThisMonth
) {}
