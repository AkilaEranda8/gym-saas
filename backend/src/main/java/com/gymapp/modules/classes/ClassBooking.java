package com.gymapp.modules.classes;

import com.gymapp.multitenancy.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "class_bookings",
       uniqueConstraints = @UniqueConstraint(columnNames = {"session_id", "member_id"}))
public class ClassBooking extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.BOOKED;

    @Column(name = "booked_at", nullable = false)
    private LocalDateTime bookedAt = LocalDateTime.now();

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_reason", columnDefinition = "text")
    private String cancelReason;

    @Column(name = "waitlist_position")
    private Integer waitlistPosition;

    @Column(name = "attended_at")
    private LocalDateTime attendedAt;
}
