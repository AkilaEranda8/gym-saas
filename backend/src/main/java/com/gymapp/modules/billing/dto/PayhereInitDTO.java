package com.gymapp.modules.billing.dto;

public record PayhereInitDTO(
        String merchant_id,
        String order_id,
        String amount,
        String currency,
        String first_name,
        String last_name,
        String email,
        String phone,
        String address,
        String city,
        String country,
        String items,
        String return_url,
        String cancel_url,
        String notify_url,
        String hash,
        String checkoutUrl
) {}
