package com.gymapp.modules.settings.entity;

import com.gymapp.modules.settings.enums.SettingCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "gym_settings_kv")
public class GymSettingKV {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(nullable = false, length = 100)
    private String key;

    @Column(columnDefinition = "TEXT")
    private String value;

    @Column(name = "value_type", length = 20)
    private String valueType = "STRING";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SettingCategory category;

    @Column(length = 255)
    private String description;

    @Column(name = "is_sensitive")
    private Boolean isSensitive = false;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
