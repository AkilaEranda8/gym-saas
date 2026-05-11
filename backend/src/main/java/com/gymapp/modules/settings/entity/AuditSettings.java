package com.gymapp.modules.settings.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "audit_settings")
public class AuditSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false, unique = true)
    private UUID gymId;

    @Column(name = "retain_days")
    private Integer retainDays = 90;

    @Column(name = "log_logins")
    private Boolean logLogins = true;

    @Column(name = "log_data_exports")
    private Boolean logDataExports = true;

    @Column(name = "log_payment_actions")
    private Boolean logPaymentActions = true;

    @Column(name = "ip_restriction_enabled")
    private Boolean ipRestrictionEnabled = false;

    @Column(name = "allowed_ips", columnDefinition = "TEXT[]")
    private List<String> allowedIps;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
