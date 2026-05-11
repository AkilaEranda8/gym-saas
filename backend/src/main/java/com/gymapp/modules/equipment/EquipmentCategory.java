package com.gymapp.modules.equipment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "equipment_categories")
@SQLRestriction("deleted_at IS NULL")
public class EquipmentCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "gym_id", nullable = false, updatable = false)
    private UUID gymId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 10)
    private String icon;

    @Column(length = 7)
    private String color;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
