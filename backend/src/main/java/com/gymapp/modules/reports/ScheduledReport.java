package com.gymapp.modules.reports;

import com.gymapp.modules.reports.enums.ReportFrequency;
import com.gymapp.modules.reports.enums.ReportType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "scheduled_reports")
public class ScheduledReport {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 50)
    private ReportType reportType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportFrequency frequency;

    @Column(columnDefinition = "TEXT[]")
    private List<String> recipients = new ArrayList<>();

    @Column(name = "whatsapp_numbers", columnDefinition = "TEXT[]")
    private List<String> whatsappNumbers = new ArrayList<>();

    @Column(name = "last_sent_at")
    private LocalDateTime lastSentAt;

    @Column(name = "next_send_at", nullable = false)
    private LocalDateTime nextSendAt;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "config_json", columnDefinition = "jsonb")
    private String configJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
