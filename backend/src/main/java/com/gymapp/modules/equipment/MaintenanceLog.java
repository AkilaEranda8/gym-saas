package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.enums.MaintenanceLogAction;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "maintenance_logs")
public class MaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(name = "logged_by", nullable = false, length = 100)
    private String loggedBy;

    @Column(name = "logged_by_name", length = 100)
    private String loggedByName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MaintenanceLogAction action;

    @Column(name = "old_status", length = 20)
    private String oldStatus;

    @Column(name = "new_status", length = 20)
    private String newStatus;

    @Column(columnDefinition = "text")
    private String comment;

    @Column(name = "cost_lkr")
    private Long costLkr;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", insertable = false, updatable = false)
    private MaintenanceRequest request;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
