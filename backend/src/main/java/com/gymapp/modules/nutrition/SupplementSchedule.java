package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.enums.SupplementTiming;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "supplement_schedules")
public class SupplementSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "supplement_name", nullable = false, length = 100)
    private String supplementName;

    @Column(length = 50)
    private String dosage;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private SupplementTiming timing;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
