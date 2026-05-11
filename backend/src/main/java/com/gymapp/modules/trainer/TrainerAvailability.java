package com.gymapp.modules.trainer;

import com.gymapp.multitenancy.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "trainer_availability")
public class TrainerAvailability extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", insertable = false, updatable = false)
    private Trainer trainer;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_available")
    private Boolean isAvailable = true;
}
