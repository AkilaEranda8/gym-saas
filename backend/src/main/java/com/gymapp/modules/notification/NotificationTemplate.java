package com.gymapp.modules.notification;

import com.gymapp.modules.notification.enums.NotificationChannel;
import com.gymapp.modules.notification.enums.NotificationLanguage;
import com.gymapp.modules.notification.enums.NotificationType;
import com.gymapp.modules.notification.enums.NotificationLanguageConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "notification_templates",
    uniqueConstraints = @UniqueConstraint(columnNames = {"gym_id","type","channel","language"}))
@EntityListeners(AuditingEntityListener.class)
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id")
    private UUID gymId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel;

    @Convert(converter = NotificationLanguageConverter.class)
    @Column(nullable = false, length = 5)
    private NotificationLanguage language = NotificationLanguage.EN;

    @Column(length = 150)
    private String subject;

    @Column(name = "body_template", nullable = false, columnDefinition = "text")
    private String bodyTemplate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
