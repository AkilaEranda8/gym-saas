package com.gymapp.modules.trainer;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "trainer_reviews")
public class TrainerReview extends TenantEntity {

    @Column(name = "trainer_id", nullable = false)
    private UUID trainerId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;
}
