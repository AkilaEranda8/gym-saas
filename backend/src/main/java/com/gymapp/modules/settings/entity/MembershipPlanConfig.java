package com.gymapp.modules.settings.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "membership_plan_configs")
public class MembershipPlanConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "plan_name", nullable = false, length = 20)
    private String planName;

    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName;

    @Column(name = "price_lkr", nullable = false)
    private Long priceLkr;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays = 30;

    @Column(length = 7)
    private String color;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private JsonNode features;

    @Column(name = "max_classes_per_week")
    private Integer maxClassesPerWeek = -1;

    @Column(name = "max_pt_sessions")
    private Integer maxPtSessions = 0;

    @Column(name = "locker_included")
    private Boolean lockerIncluded = false;

    @Column(name = "guest_passes")
    private Integer guestPasses = 0;

    @Column(name = "discount_pct", precision = 5, scale = 2)
    private BigDecimal discountPct = BigDecimal.ZERO;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
