package com.gymapp.modules.trainer;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "trainers")
@SQLRestriction("deleted_at IS NULL")
public class Trainer extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "keycloak_id", length = 100)
    private String keycloakId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 20)
    private String nic;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT[]")
    private String[] specialties;

    @Column(columnDefinition = "TEXT[]")
    private String[] certifications;

    @Column(name = "experience_years")
    private Integer experienceYears = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20)
    private EmploymentType employmentType = EmploymentType.FULL_TIME;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TrainerStatus status = TrainerStatus.ACTIVE;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(name = "salary_lkr")
    private Long salaryLkr;

    @Column(name = "joined_date", nullable = false)
    private LocalDate joinedDate;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "trainer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainerSpecialtyEntity> specialtyList = new ArrayList<>();

    @OneToMany(mappedBy = "trainer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainerCertification> certificationList = new ArrayList<>();

    @OneToMany(mappedBy = "trainer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrainerAvailability> availabilityList = new ArrayList<>();
}
