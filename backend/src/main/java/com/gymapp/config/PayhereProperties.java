package com.gymapp.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "payhere")
public class PayhereProperties {
    private String merchantId;
    private String merchantSecret;
    private String apiUrl;
    private String checkoutUrl;
    private String sandboxUrl;
    private String notifyUrl;
    private String returnUrl;
    private String cancelUrl;
    private boolean sandbox = true;
}
