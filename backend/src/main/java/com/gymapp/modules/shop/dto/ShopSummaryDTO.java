package com.gymapp.modules.shop.dto;

public record ShopSummaryDTO(
    long todayOrders,
    String todayRevenue,
    long todayRevenueRaw,
    long weekOrders,
    String weekRevenue,
    long weekRevenueRaw,
    long monthOrders,
    String monthRevenue,
    long monthRevenueRaw,
    long totalProducts,
    long lowStockProducts,
    long outOfStockProducts,
    long pendingPurchaseOrders
) {}
