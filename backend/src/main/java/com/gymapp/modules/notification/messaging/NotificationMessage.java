package com.gymapp.modules.notification.messaging;

import com.gymapp.modules.notification.enums.NotificationChannel;
import com.gymapp.modules.notification.enums.NotificationLanguage;
import com.gymapp.modules.notification.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage implements Serializable {

    private String notificationId;
    private String gymId;
    private NotificationChannel channel;
    private String recipient;
    private String subject;
    private String message;
    private NotificationType templateType;
    private NotificationLanguage language;

    @Builder.Default
    private Integer priority = 3;

    @Builder.Default
    private Integer retryCount = 0;

    @Builder.Default
    private Integer maxRetries = 3;

    private LocalDateTime scheduledAt;

    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();
}
