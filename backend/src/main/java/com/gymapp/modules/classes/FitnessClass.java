package com.gymapp.modules.classes;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "fitness_classes")
@SQLRestriction("deleted_at IS NULL")
public class FitnessClass extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "trainer_id")
    private UUID trainerId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ClassType type;

    @Column(length = 50)
    private String room;

    @Column(nullable = false)
    private int capacity = 20;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes = 60;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClassDifficulty difficulty = ClassDifficulty.ALL_LEVELS;

    @Column(length = 7)
    private String color;

    @Column(name = "is_recurring", nullable = false)
    private boolean isRecurring = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
