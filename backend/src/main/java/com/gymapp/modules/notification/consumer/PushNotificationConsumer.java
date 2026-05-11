package com.gymapp.modules.notification.consumer;

import com.gymapp.config.RabbitMQConfig;
import com.gymapp.modules.notification.*;
import com.gymapp.modules.notification.enums.NotificationStatus;
import com.gymapp.modules.notification.messaging.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class PushNotificationConsumer {

    private final NotificationLogRepository logRepository;
    private final PushTokenRepository       pushTokenRepository;
    private final RabbitTemplate            rabbitTemplate;

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private final RestTemplate restTemplate = new RestTemplate();

    @RabbitListener(queues = {RabbitMQConfig.PUSH_HIGH_QUEUE, RabbitMQConfig.PUSH_NORMAL_QUEUE})
    public void process(NotificationMessage msg) {
        log.debug("Processing push notification for recipient: {}", msg.getRecipient());

        if (msg.getRecipient() == null || msg.getRecipient().isBlank()) {
            log.warn("Push notification skipped — no token");
            return;
        }

        boolean tokenActive = pushTokenRepository.findByUserIdAndToken(
            msg.getRecipient(), msg.getRecipient()).isPresent();

        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("to", List.of(msg.getRecipient()));
            payload.put("title", msg.getSubject() != null ? msg.getSubject() : "");
            payload.put("body", msg.getMessage());
            payload.put("sound", "default");
            if (msg.getMetadata() != null && !msg.getMetadata().isEmpty()) {
                payload.put("data", msg.getMetadata());
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(EXPO_PUSH_URL, request, Map.class);

            String providerRef = extractTicketId(response.getBody());
            updateLog(msg, NotificationStatus.SENT, providerRef, null);
            log.info("Push notification sent: ticket={}", providerRef);

        } catch (Exception e) {
            log.error("Push notification failed for {}: {}", msg.getRecipient(), e.getMessage());
            int retryCount = msg.getRetryCount() != null ? msg.getRetryCount() : 0;
            if (retryCount < (msg.getMaxRetries() != null ? msg.getMaxRetries() : 3)) {
                msg.setRetryCount(retryCount + 1);
                rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_EXCHANGE,
                    RabbitMQConfig.PUSH_NORMAL_KEY, msg);
                log.info("Requeued push notification, attempt {}", retryCount + 1);
            } else {
                updateLog(msg, NotificationStatus.FAILED, null, e.getMessage());
                deactivateToken(msg.getRecipient());
            }
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTicketId(Map<?, ?> body) {
        if (body == null) return null;
        Object data = body.get("data");
        if (data instanceof List<?> list && !list.isEmpty()) {
            Object first = list.get(0);
            if (first instanceof Map<?, ?> ticket) {
                Object id = ticket.get("id");
                return id != null ? id.toString() : null;
            }
        }
        return null;
    }

    private void updateLog(NotificationMessage msg, NotificationStatus status,
                           String providerRef, String error) {
        try {
            if (msg.getNotificationId() == null) return;
            List<NotificationLog> logs = logRepository.findAllByNotificationId(
                UUID.fromString(msg.getNotificationId()));
            logs.stream()
                .filter(l -> msg.getRecipient().equals(l.getRecipient()))
                .findFirst()
                .ifPresent(l -> {
                    l.setStatus(status);
                    l.setProviderRef(providerRef);
                    l.setErrorMessage(error);
                    if (status == NotificationStatus.SENT) l.setSentAt(LocalDateTime.now());
                    logRepository.save(l);
                });
        } catch (Exception e) {
            log.warn("Failed to update notification log: {}", e.getMessage());
        }
    }

    private void deactivateToken(String token) {
        try {
            pushTokenRepository.deactivateByTokens(List.of(token));
        } catch (Exception e) {
            log.warn("Failed to deactivate push token: {}", e.getMessage());
        }
    }
}
