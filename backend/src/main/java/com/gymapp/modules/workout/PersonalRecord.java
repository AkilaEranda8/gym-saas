package com.gymapp.modules.workout;

import com.gymapp.multitenancy.BaseEntity;
import com.gymapp.modules.workout.enums.PersonalRecordType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "personal_records")
public class PersonalRecord extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false, length = 20)
    private PersonalRecordType recordType;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal value;

    @Column(length = 10)
    private String unit;

    @Column(name = "achieved_date", nullable = false)
    private LocalDate achievedDate;

    @Column(columnDefinition = "text")
    private String notes;
}
