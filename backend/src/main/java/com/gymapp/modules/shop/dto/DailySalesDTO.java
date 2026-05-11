package com.gymapp.modules.shop.dto;

public record DailySalesDTO(
    String date,
    long orderCount,
    long revenue,
    String revenueFormatted,
    long itemsSold
) {}
