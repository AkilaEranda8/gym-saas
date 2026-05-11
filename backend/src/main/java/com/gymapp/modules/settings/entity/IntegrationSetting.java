package com.gymapp.modules.settings.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.gymapp.modules.settings.enums.IntegrationProvider;
import com.gymapp.modules.settings.enums.IntegrationTestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "integration_settings")
public class IntegrationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private IntegrationProvider provider;

    @Column(name = "is_enabled")
    private Boolean isEnabled = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config_json", columnDefinition = "jsonb", nullable = false)
    private JsonNode configJson;

    @Column(name = "test_mode")
    private Boolean testMode = true;

    @Column(name = "last_tested_at")
    private LocalDateTime lastTestedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_test_status", length = 20)
    private IntegrationTestStatus lastTestStatus = IntegrationTestStatus.UNTESTED;

    @Column(name = "last_test_message", columnDefinition = "TEXT")
    private String lastTestMessage;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
