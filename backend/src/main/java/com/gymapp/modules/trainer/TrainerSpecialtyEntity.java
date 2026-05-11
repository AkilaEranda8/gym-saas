package com.gymapp.modules.trainer;

import com.gymapp.multitenancy.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "trainer_specialties")
public class TrainerSpecialtyEntity extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", insertable = false, updatable = false)
    private Trainer trainer;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private TrainerSpecialty specialty;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column
    private Boolean certified = false;
}
