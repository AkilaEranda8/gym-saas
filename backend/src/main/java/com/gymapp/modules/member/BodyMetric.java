package com.gymapp.modules.member;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "body_metrics")
@EntityListeners(AuditingEntityListener.class)
public class BodyMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "height_cm", precision = 5, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "bmi", precision = 4, scale = 2)
    private BigDecimal bmi;

    @Column(name = "body_fat_pct", precision = 4, scale = 2)
    private BigDecimal bodyFatPct;

    @Column(name = "muscle_mass_kg", precision = 5, scale = 2)
    private BigDecimal muscleMassKg;

    @Column(name = "chest_cm", precision = 5, scale = 2)
    private BigDecimal chestCm;

    @Column(name = "waist_cm", precision = 5, scale = 2)
    private BigDecimal waistCm;

    @Column(name = "hip_cm", precision = 5, scale = 2)
    private BigDecimal hipCm;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate = LocalDate.now();

    @Column(columnDefinition = "text")
    private String notes;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
