package com.gymapp.modules.settings.entity;

import com.gymapp.modules.settings.enums.FeatureKey;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "feature_flags")
public class FeatureFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Enumerated(EnumType.STRING)
    @Column(name = "feature_key", nullable = false, length = 50)
    private FeatureKey featureKey;

    @Column(name = "is_enabled")
    private Boolean isEnabled = true;

    @Column(name = "enabled_by_plan")
    private Boolean enabledByPlan = false;

    @Column(name = "override_by_admin")
    private Boolean overrideByAdmin = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
