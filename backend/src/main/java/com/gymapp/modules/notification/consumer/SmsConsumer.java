package com.gymapp.modules.notification.consumer;

import com.gymapp.config.RabbitMQConfig;
import com.gymapp.modules.notification.NotificationLog;
import com.gymapp.modules.notification.NotificationLogRepository;
import com.gymapp.modules.notification.enums.NotificationStatus;
import com.gymapp.modules.notification.messaging.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class SmsConsumer {

    private final NotificationLogRepository logRepository;

    @Value("${dialog.sms.api-url:https://api.dialog.lk/v1/sms/send}")
    private String dialogSmsUrl;

    @Value("${dialog.sms.api-key:}")
    private String apiKey;

    @Value("${dialog.sms.sender-id:GymApp}")
    private String senderId;

    private final RestTemplate restTemplate = new RestTemplate();

    @RabbitListener(queues = RabbitMQConfig.SMS_QUEUE)
    public void process(NotificationMessage msg) {
        log.debug("Processing SMS to {}", msg.getRecipient());

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Dialog SMS API key not configured — skipping");
            updateLogStatus(msg, NotificationStatus.FAILED, null, "API key not configured");
            return;
        }

        String smsMessage = msg.getMessage();
        if (smsMessage != null && smsMessage.length() > 160) {
            smsMessage = smsMessage.substring(0, 157) + "...";
        }

        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("to",        msg.getRecipient());
            payload.put("message",   smsMessage);
            payload.put("sender_id", senderId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(dialogSmsUrl, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String ref = extractRef(response.getBody());
                updateLogStatus(msg, NotificationStatus.SENT, ref, null);
                log.info("SMS sent to {}: ref={}", msg.getRecipient(), ref);
            } else {
                updateLogStatus(msg, NotificationStatus.FAILED, null,
                    "Status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("SMS failed for {}: {}", msg.getRecipient(), e.getMessage());
            updateLogStatus(msg, NotificationStatus.FAILED, null, e.getMessage());
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
            log.warn("Failed to update SMS log: {}", e.getMessage());
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
