package com.gymapp.modules.notification;

import com.gymapp.modules.notification.dto.NotificationDtos;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendToUser(String userId, NotificationDtos.NotificationDTO notification) {
        try {
            messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
            log.debug("WS notification sent to user {}", userId);
        } catch (Exception e) {
            log.warn("WS send to user {} failed: {}", userId, e.getMessage());
        }
    }

    public void sendUnreadCount(String userId, long unreadCount) {
        try {
            messagingTemplate.convertAndSendToUser(userId, "/queue/unread-count",
                Map.of("unreadCount", unreadCount));
        } catch (Exception e) {
            log.warn("WS unread-count to {} failed: {}", userId, e.getMessage());
        }
    }

    public void broadcastToGym(String gymId, NotificationDtos.NotificationDTO notification) {
        try {
            messagingTemplate.convertAndSend("/topic/gym/" + gymId + "/notifications", notification);
        } catch (Exception e) {
            log.warn("WS broadcast to gym {} failed: {}", gymId, e.getMessage());
        }
    }
}
