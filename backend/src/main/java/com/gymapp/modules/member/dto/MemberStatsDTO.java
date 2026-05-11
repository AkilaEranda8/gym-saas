package com.gymapp.modules.member.dto;

public record MemberStatsDTO(
    long totalMembers,
    long activeMembers,
    long expiringThisWeek,
    long expiredMembers,
    long checkedInToday,
    long newThisMonth
) {}
