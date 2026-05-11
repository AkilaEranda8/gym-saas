package com.gymapp.modules.trainer;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "trainer_sessions")
public class TrainerSession extends TenantEntity {

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PTSessionStatus status = PTSessionStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "member_feedback", columnDefinition = "TEXT")
    private String memberFeedback;

    @Column(name = "trainer_notes", columnDefinition = "TEXT")
    private String trainerNotes;
}
