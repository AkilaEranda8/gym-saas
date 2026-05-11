package com.gymapp.modules.billing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PayhereNotifyRequest {

    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("payment_id")
    private String paymentId;

    @JsonProperty("payhere_amount")
    private String payhereAmount;

    @JsonProperty("payhere_currency")
    private String payhereCurrency;

    @JsonProperty("status_code")
    private Integer statusCode;

    @JsonProperty("md5sig")
    private String md5sig;

    @JsonProperty("status_message")
    private String statusMessage;

    @JsonProperty("method")
    private String method;

    @JsonProperty("card_holder_name")
    private String cardHolderName;

    @JsonProperty("card_no")
    private String cardNo;

    @JsonProperty("card_expiry")
    private String cardExpiry;

    @JsonProperty("recurring")
    private Integer recurring;

    @JsonProperty("message_type")
    private String messageType;
}
