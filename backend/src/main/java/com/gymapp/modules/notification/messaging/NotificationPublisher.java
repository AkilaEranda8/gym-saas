package com.gymapp.modules.notification.messaging;

import com.gymapp.config.RabbitMQConfig;
import com.gymapp.modules.notification.*;
import com.gymapp.modules.notification.enums.NotificationChannel;
import com.gymapp.modules.notification.enums.NotificationStatus;
import com.gymapp.modules.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationPublisher {

    private final RabbitTemplate          rabbitTemplate;
    private final NotificationLogRepository logRepository;
    private final PushTokenRepository     pushTokenRepository;

    public void send(NotificationMessage msg) {
        String routingKey = resolveRoutingKey(msg.getChannel(), msg.getPriority());
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_EXCHANGE, routingKey, msg);
            persistLog(msg, NotificationStatus.QUEUED, null, null);
            log.debug("Published {} notification to {}", msg.getChannel(), routingKey);
        } catch (Exception e) {
            log.error("Failed to publish notification via {}: {}", routingKey, e.getMessage());
            persistLog(msg, NotificationStatus.FAILED, null, e.getMessage());
        }
    }

    public void sendPush(String userId, NotificationType type, String title,
                         String message, Map<String, Object> data,
                         Integer priority, String gymId, String notificationId) {
        List<PushToken> tokens = pushTokenRepository.findAllByUserIdAndIsActiveTrue(userId);
        if (tokens.isEmpty()) {
            log.debug("No active push tokens for user {}", userId);
            return;
        }
        for (PushToken token : tokens) {
            NotificationMessage msg = NotificationMessage.builder()
                .notificationId(notificationId)
                .gymId(gymId)
                .channel(NotificationChannel.PUSH)
                .recipient(token.getToken())
                .subject(title)
                .message(message)
                .templateType(type)
                .priority(priority != null ? priority : 3)
                .metadata(data != null ? data : Map.of())
                .build();
            send(msg);
        }
    }

    public void sendWhatsApp(String phone, String message, String gymId,
                             Integer priority, String notificationId) {
        NotificationMessage msg = NotificationMessage.builder()
            .notificationId(notificationId)
            .gymId(gymId)
            .channel(NotificationChannel.WHATSAPP)
            .recipient(phone)
            .message(message)
            .priority(priority != null ? priority : 3)
            .build();
        send(msg);
    }

    public void sendSms(String phone, String message, String gymId, String notificationId) {
        NotificationMessage msg = NotificationMessage.builder()
            .notificationId(notificationId)
            .gymId(gymId)
            .channel(NotificationChannel.SMS)
            .recipient(phone)
            .message(message)
            .priority(3)
            .build();
        send(msg);
    }

    public void sendEmail(String email, String subject, String body,
                          String gymId, String notificationId) {
        NotificationMessage msg = NotificationMessage.builder()
            .notificationId(notificationId)
            .gymId(gymId)
            .channel(NotificationChannel.EMAIL)
            .recipient(email)
            .subject(subject)
            .message(body)
            .priority(3)
            .build();
        send(msg);
    }

    public void sendBulk(BulkNotificationJob job) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.BULK_KEY, job);
            log.info("Published bulk job {} to queue", job.getId());
        } catch (Exception e) {
            log.error("Failed to publish bulk job {}: {}", job.getId(), e.getMessage());
        }
    }

    private String resolveRoutingKey(NotificationChannel channel, Integer priority) {
        if (priority == null) priority = 3;
        return switch (channel) {
            case PUSH      -> priority <= 2 ? RabbitMQConfig.PUSH_HIGH_KEY    : RabbitMQConfig.PUSH_NORMAL_KEY;
            case WHATSAPP  -> priority <= 2 ? RabbitMQConfig.WHATSAPP_HIGH_KEY: RabbitMQConfig.WHATSAPP_NORMAL_KEY;
            case SMS       -> RabbitMQConfig.SMS_KEY;
            case EMAIL     -> RabbitMQConfig.EMAIL_KEY;
        };
    }

    private void persistLog(NotificationMessage msg, NotificationStatus status,
                            String providerRef, String errorMsg) {
        try {
            NotificationLog notifLog = new NotificationLog();
            if (msg.getNotificationId() != null) {
                notifLog.setNotificationId(UUID.fromString(msg.getNotificationId()));
            }
            if (msg.getGymId() != null) {
                notifLog.setGymId(UUID.fromString(msg.getGymId()));
            }
            notifLog.setChannel(msg.getChannel());
            notifLog.setRecipient(msg.getRecipient() != null ? msg.getRecipient() : "unknown");
            notifLog.setStatus(status);
            notifLog.setProviderRef(providerRef);
            notifLog.setErrorMessage(errorMsg);
            if (status == NotificationStatus.SENT || status == NotificationStatus.QUEUED) {
                notifLog.setSentAt(LocalDateTime.now());
            }
            logRepository.save(notifLog);
        } catch (Exception ex) {
            log.warn("Failed to persist notification log: {}", ex.getMessage());
        }
    }
}
