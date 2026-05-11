package com.gymapp.modules.notification.consumer;

import com.gymapp.config.RabbitMQConfig;
import com.gymapp.modules.notification.NotificationLog;
import com.gymapp.modules.notification.NotificationLogRepository;
import com.gymapp.modules.notification.enums.NotificationStatus;
import com.gymapp.modules.notification.messaging.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class WhatsAppConsumer {

    private final NotificationLogRepository logRepository;
    private final RabbitTemplate            rabbitTemplate;

    @Value("${dialog.whatsapp.api-url:https://api.dialog.lk/v1/whatsapp/send}")
    private String dialogApiUrl;

    @Value("${dialog.whatsapp.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @RabbitListener(queues = {RabbitMQConfig.WHATSAPP_HIGH_QUEUE, RabbitMQConfig.WHATSAPP_NORMAL_QUEUE})
    public void process(NotificationMessage msg) {
        log.debug("Processing WhatsApp message to {}", msg.getRecipient());

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Dialog WhatsApp API key not configured — skipping");
            updateLogStatus(msg, NotificationStatus.FAILED, null, "API key not configured");
            return;
        }

        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("to",      msg.getRecipient());
            payload.put("message", msg.getMessage());
            payload.put("type",    "text");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(dialogApiUrl, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String ref = extractRef(response.getBody());
                updateLogStatus(msg, NotificationStatus.SENT, ref, null);
                log.info("WhatsApp sent to {}: ref={}", msg.getRecipient(), ref);
            } else {
                handleRetryOrFail(msg, "Non-2xx status: " + response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 429) {
                log.warn("WhatsApp rate limited — requeuing");
                rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_EXCHANGE,
                    RabbitMQConfig.WHATSAPP_NORMAL_KEY, msg);
            } else {
                handleRetryOrFail(msg, e.getMessage());
                if (msg.getPriority() != null && msg.getPriority() <= 2) {
                    fallbackToSms(msg);
                }
            }
        } catch (Exception e) {
            handleRetryOrFail(msg, e.getMessage());
        }
    }

    private void fallbackToSms(NotificationMessage msg) {
        try {
            NotificationMessage smsMsg = NotificationMessage.builder()
                .notificationId(msg.getNotificationId())
                .gymId(msg.getGymId())
                .channel(com.gymapp.modules.notification.enums.NotificationChannel.SMS)
                .recipient(msg.getRecipient())
                .message(msg.getMessage())
                .priority(msg.getPriority())
                .build();
            rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.SMS_KEY, smsMsg);
            log.info("Fell back to SMS for {}", msg.getRecipient());
        } catch (Exception e) {
            log.error("SMS fallback failed: {}", e.getMessage());
        }
    }

    private void handleRetryOrFail(NotificationMessage msg, String error) {
        int retries = msg.getRetryCount() != null ? msg.getRetryCount() : 0;
        int maxRetries = msg.getMaxRetries() != null ? msg.getMaxRetries() : 3;
        if (retries < maxRetries) {
            msg.setRetryCount(retries + 1);
            rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.WHATSAPP_NORMAL_KEY, msg);
        } else {
            updateLogStatus(msg, NotificationStatus.FAILED, null, error);
        }
    }

    private void updateLogStatus(NotificationMessage msg, NotificationStatus status,
                                 String ref, String error) {
        try {
            if (msg.getNotificationId() == null) return;
            List<NotificationLog> logs = logRepository.findAllByNotificationId(
                UUID.fromString(msg.getNotificationId()));
            logs.stream()
                .filter(l -> msg.getRecipient() != null && msg.getRecipient().equals(l.getRecipient()))
                .findFirst()
                .ifPresent(l -> {
                    l.setStatus(status);
                    l.setProviderRef(ref);
                    l.setErrorMessage(error);
                    if (status == NotificationStatus.SENT) l.setSentAt(LocalDateTime.now());
                    logRepository.save(l);
                });
        } catch (Exception e) {
            log.warn("Failed to update WhatsApp log: {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String extractRef(Map<?, ?> body) {
        if (body == null) return null;
        Object id = body.get("message_id");
        if (id == null) id = body.get("id");
        return id != null ? id.toString() : null;
    }
}
