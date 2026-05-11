package com.gymapp.modules.settings.entity;

import com.gymapp.modules.settings.enums.DeviceType;
import com.gymapp.modules.settings.enums.LoginStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "login_history")
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "user_email", length = 100)
    private String userEmail;

    @Column(name = "user_role", length = 30)
    private String userRole;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", length = 20)
    private DeviceType deviceType;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoginStatus status;

    @Column(name = "failure_reason", length = 100)
    private String failureReason;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt = LocalDateTime.now();
}
