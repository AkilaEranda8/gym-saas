package com.gymapp.modules.member.dto;

import com.gymapp.modules.member.BodyMetric;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BodyMetricDTO(
    UUID id,
    UUID memberId,
    BigDecimal weightKg,
    BigDecimal heightCm,
    BigDecimal bmi,
    BigDecimal bodyFatPct,
    BigDecimal muscleMassKg,
    BigDecimal chestCm,
    BigDecimal waistCm,
    BigDecimal hipCm,
    LocalDate recordedDate,
    String notes,
    String bmiStatus,
    String bmiStatusColor
) {
    public static BodyMetricDTO from(BodyMetric m) {
        String status = "NORMAL";
        String color  = "#34d399";
        if (m.getBmi() != null) {
            double bmi = m.getBmi().doubleValue();
            if (bmi < 18.5)      { status = "UNDERWEIGHT"; color = "#60a5fa"; }
            else if (bmi < 25.0) { status = "NORMAL";      color = "#34d399"; }
            else if (bmi < 30.0) { status = "OVERWEIGHT";  color = "#f59e0b"; }
            else                 { status = "OBESE";        color = "#f87171"; }
        }
        return new BodyMetricDTO(
            m.getId(), m.getMemberId(),
            m.getWeightKg(), m.getHeightCm(), m.getBmi(),
            m.getBodyFatPct(), m.getMuscleMassKg(),
            m.getChestCm(), m.getWaistCm(), m.getHipCm(),
            m.getRecordedDate(), m.getNotes(),
            status, color
        );
    }
}
