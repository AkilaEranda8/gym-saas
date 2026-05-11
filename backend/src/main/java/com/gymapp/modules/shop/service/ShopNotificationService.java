package com.gymapp.modules.shop.service;

import com.gymapp.modules.shop.dto.LowStockAlertDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShopNotificationService {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange:gym.notifications}")
    private String exchange;

    @Value("${rabbitmq.routing-key.email:email.notification}")
    private String emailRoutingKey;

    public void sendLowStockAlert(List<LowStockAlertDTO> alerts, String gymName) {
        if (alerts.isEmpty()) return;
        try {
            Map<String, Object> msg = Map.of(
                "type", "LOW_STOCK_ALERT",
                "gymName", gymName,
                "alertCount", alerts.size(),
                "products", alerts.stream().map(a -> Map.of(
                    "name", a.productName(),
                    "sku", a.sku() != null ? a.sku() : "",
                    "stock", a.currentStock(),
                    "min", a.minStockQty(),
                    "status", a.stockStatus()
                )).toList()
            );
            rabbitTemplate.convertAndSend(exchange, emailRoutingKey, msg);
            log.info("Low stock alert sent for {} products", alerts.size());
        } catch (Exception e) {
            log.error("Failed to send low stock alert", e);
        }
    }

    public void sendOrderConfirmation(String orderNumber, long totalLkr, String memberEmail) {
        if (memberEmail == null || memberEmail.isBlank()) return;
        try {
            Map<String, Object> msg = Map.of(
                "type", "ORDER_CONFIRMATION",
                "to", memberEmail,
                "orderNumber", orderNumber,
                "total", "Rs. " + totalLkr / 100.0
            );
            rabbitTemplate.convertAndSend(exchange, emailRoutingKey, msg);
        } catch (Exception e) {
            log.error("Failed to send order confirmation", e);
        }
    }
}
