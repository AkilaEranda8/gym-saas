package com.gymapp.modules.notification;

import com.gymapp.config.RabbitMQConfig;
import com.gymapp.modules.notification.enums.NotificationType;
import com.gymapp.modules.notification.enums.RecipientType;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RabbitTemplate         rabbitTemplate;
    private final CurrentUser            currentUser;

    public Page<Notification> getMyNotifications(Pageable pageable) {
        return notificationRepository.findAllByGymIdAndRecipientIdOrderByCreatedAtDesc(
            TenantContext.getGymId(), currentUser.getUserId(), pageable);
    }

    public long getUnreadCount() {
        return notificationRepository.countByGymIdAndRecipientIdAndIsReadFalse(
            TenantContext.getGymId(), currentUser.getUserId());
    }

    @Transactional
    public Notification markRead(UUID id) {
        Notification n = notificationRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Notification not found"));
        n.setIsRead(true);
        return notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead() {
        notificationRepository.markAllReadByGymIdAndRecipientId(
            TenantContext.getGymId(), currentUser.getUserId(), java.time.LocalDateTime.now());
    }

    @Transactional
    public Notification send(UUID gymId, String userId, String title, String message,
                              NotificationType type, String actionUrl) {
        Notification n = new Notification();
        n.setGymId(gymId);
        n.setRecipientId(userId);
        n.setRecipientType(RecipientType.MEMBER);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        if (actionUrl != null) {
            n.setDataJson(Map.of("actionUrl", actionUrl));
        }
        Notification saved = notificationRepository.save(n);

        try {
            Map<String, Object> emailPayload = Map.of(
                "to",      userId,
                "subject", title,
                "body",    message,
                "gymId",   gymId.toString()
            );
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.EMAIL_ROUTING_KEY,
                emailPayload
            );
        } catch (Exception e) {
            log.warn("Failed to queue email notification: {}", e.getMessage());
        }

        return saved;
    }

    @Transactional
    public void broadcastToGym(UUID gymId, String title, String message, NotificationType type) {
        log.info("Broadcasting notification to gym {} — {}", gymId, title);
        Map<String, Object> payload = Map.of(
            "gymId",   gymId.toString(),
            "title",   title,
            "message", message,
            "type",    type.name(),
            "broadcast", true
        );
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.NOTIFICATION_EXCHANGE,
            RabbitMQConfig.PUSH_ROUTING_KEY,
            payload
        );
    }
}
