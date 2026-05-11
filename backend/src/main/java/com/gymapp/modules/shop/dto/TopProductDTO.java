package com.gymapp.modules.shop.dto;

import java.util.UUID;

public record TopProductDTO(
    UUID productId,
    String productName,
    String categoryName,
    long qtySold,
    long revenue,
    String revenueFormatted
) {}
