package com.gymapp.modules.trainer;

import com.gymapp.multitenancy.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "trainer_certifications")
public class TrainerCertification extends BaseEntity {

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", insertable = false, updatable = false)
    private Trainer trainer;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "issuing_body", length = 100)
    private String issuingBody;

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "certificate_url", length = 255)
    private String certificateUrl;

    @Column(name = "is_verified")
    private Boolean isVerified = false;
}
