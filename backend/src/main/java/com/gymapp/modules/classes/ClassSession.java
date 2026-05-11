package com.gymapp.modules.classes;

import com.gymapp.multitenancy.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "class_sessions")
public class ClassSession extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "class_id", nullable = false)
    private UUID classId;

    @Column(name = "schedule_id")
    private UUID scheduleId;

    @Column(name = "trainer_id")
    private UUID trainerId;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "actual_capacity", nullable = false)
    private int actualCapacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status = SessionStatus.SCHEDULED;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "cancel_reason", columnDefinition = "text")
    private String cancelReason;

    @Transient
    private int bookedCount;

    @Transient
    private int waitlistCount;

    public int getAvailableSlots() {
        return Math.max(0, actualCapacity - bookedCount);
    }

    public boolean isFull() {
        return bookedCount >= actualCapacity;
    }
}
