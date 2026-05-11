package com.gymapp.modules.notification;

import com.gymapp.multitenancy.TenantEntity;
import com.gymapp.modules.notification.enums.NotificationType;
import com.gymapp.modules.notification.enums.RecipientType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "notifications")
public class Notification extends TenantEntity {

    @Column(name = "recipient_id", nullable = false, length = 100)
    private String recipientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_type", nullable = false, length = 20)
    private RecipientType recipientType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data_json", columnDefinition = "jsonb")
    private Map<String, Object> dataJson;

    @Column(columnDefinition = "TEXT[]")
    private List<String> channels = new ArrayList<>();

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "is_sent", nullable = false)
    private Boolean isSent = false;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}
