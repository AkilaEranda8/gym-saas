package com.gymapp.modules.notification;

import com.gymapp.multitenancy.TenantEntity;
import com.gymapp.modules.notification.enums.BulkJobStatus;
import com.gymapp.modules.notification.enums.TargetAudience;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "bulk_notification_jobs")
public class BulkNotificationJob extends TenantEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", nullable = false, length = 30)
    private TargetAudience targetAudience;

    @Column(name = "target_plan", length = 20)
    private String targetPlan;

    @Column(name = "target_ids", columnDefinition = "TEXT[]")
    private List<String> targetIds = new ArrayList<>();

    @Column(columnDefinition = "TEXT[]")
    private List<String> channels = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BulkJobStatus status = BulkJobStatus.PENDING;

    @Column(name = "total_recipients", nullable = false)
    private Integer totalRecipients = 0;

    @Column(name = "sent_count", nullable = false)
    private Integer sentCount = 0;

    @Column(name = "failed_count", nullable = false)
    private Integer failedCount = 0;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}
