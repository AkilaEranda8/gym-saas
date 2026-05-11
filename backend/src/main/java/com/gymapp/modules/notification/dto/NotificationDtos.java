package com.gymapp.modules.notification.dto;

import com.gymapp.modules.notification.enums.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class NotificationDtos {

    private NotificationDtos() {}

    // ── Request DTOs ──────────────────────────────────────────────────────────

    public record SendNotificationRequest(
        @NotBlank String recipientId,
        @NotNull RecipientType recipientType,
        @NotNull NotificationType type,
        @NotBlank @Size(max = 150) String title,
        @NotBlank String message,
        @NotEmpty List<String> channels,
        Map<String, Object> dataJson,
        NotificationLanguage language
    ) {
        public NotificationLanguage resolvedLanguage() {
            return language != null ? language : NotificationLanguage.EN;
        }
    }

    public record SendBulkNotificationRequest(
        @NotBlank @Size(max = 150) String title,
        @NotBlank String message,
        @NotNull TargetAudience targetAudience,
        String targetPlan,
        List<String> targetIds,
        @NotEmpty List<String> channels,
        LocalDateTime scheduledAt,
        NotificationLanguage language
    ) {
        public NotificationLanguage resolvedLanguage() {
            return language != null ? language : NotificationLanguage.EN;
        }
    }

    public record RegisterPushTokenRequest(
        @NotBlank String token,
        @NotBlank String platform,
        String deviceName
    ) {}

    public record UpdatePreferencesRequest(
        @NotNull @NotEmpty List<PreferenceItem> preferences
    ) {}

    public record PreferenceItem(
        @NotNull NotificationType notificationType,
        boolean pushEnabled,
        boolean whatsappEnabled,
        boolean smsEnabled,
        boolean emailEnabled,
        LocalTime quietHoursStart,
        LocalTime quietHoursEnd
    ) {}

    public record CreateTemplateRequest(
        @NotNull NotificationType type,
        @NotNull NotificationChannel channel,
        NotificationLanguage language,
        String subject,
        @NotBlank String bodyTemplate
    ) {
        public NotificationLanguage resolvedLanguage() {
            return language != null ? language : NotificationLanguage.EN;
        }
    }

    // ── Response DTOs ─────────────────────────────────────────────────────────

    public record NotificationDTO(
        UUID id,
        UUID gymId,
        String recipientId,
        String recipientType,
        String type,
        String typeCategory,
        String typeLabel,
        String title,
        String message,
        Map<String, Object> dataJson,
        List<String> channels,
        Boolean isRead,
        LocalDateTime readAt,
        Boolean isSent,
        LocalDateTime sentAt,
        LocalDateTime createdAt,
        String timeAgo
    ) {}

    public record NotificationLogDTO(
        UUID id,
        UUID notificationId,
        String channel,
        String recipient,
        String status,
        String providerRef,
        String errorMessage,
        LocalDateTime sentAt,
        LocalDateTime deliveredAt,
        LocalDateTime createdAt
    ) {}

    public record NotificationSummaryDTO(
        long totalCount,
        long unreadCount,
        Map<String, Long> byType,
        Map<String, Long> byChannel,
        List<NotificationDTO> recentNotifications
    ) {}

    public record NotificationTemplateDTO(
        UUID id,
        UUID gymId,
        String type,
        String typeLabel,
        String channel,
        String language,
        String subject,
        String bodyTemplate,
        Boolean isActive,
        Boolean isCustom,
        boolean isGlobal,
        String previewText
    ) {}

    public record PushTokenDTO(
        UUID id,
        String userId,
        String platform,
        String deviceName,
        Boolean isActive,
        LocalDateTime lastUsedAt,
        LocalDateTime createdAt
    ) {}

    public record NotificationPreferenceDTO(
        String userId,
        List<PreferenceItemDTO> preferences
    ) {}

    public record PreferenceItemDTO(
        String notificationType,
        String typeLabel,
        String typeCategory,
        boolean pushEnabled,
        boolean whatsappEnabled,
        boolean smsEnabled,
        boolean emailEnabled,
        LocalTime quietHoursStart,
        LocalTime quietHoursEnd
    ) {}

    public record BulkNotificationJobDTO(
        UUID id,
        UUID gymId,
        String title,
        String message,
        String targetAudience,
        String targetAudienceLabel,
        String targetPlan,
        List<String> channels,
        String status,
        Integer totalRecipients,
        Integer sentCount,
        Integer failedCount,
        double successRatePct,
        LocalDateTime scheduledAt,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        String createdBy,
        LocalDateTime createdAt,
        Long durationSeconds
    ) {}

    public record NotificationStatsDTO(
        long totalSentToday,
        long totalSentThisMonth,
        double deliveryRatePct,
        double failureRatePct,
        Map<String, ChannelStatDTO> byChannel,
        Map<String, Long> byType,
        List<NotificationLogDTO> recentFailures,
        long pendingBulkJobs
    ) {}

    public record ChannelStatDTO(
        String channel,
        String channelLabel,
        long sentCount,
        long deliveredCount,
        long failedCount,
        double deliveryRatePct
    ) {}
}
