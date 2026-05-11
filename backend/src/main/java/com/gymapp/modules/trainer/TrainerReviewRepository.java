package com.gymapp.modules.trainer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainerReviewRepository extends JpaRepository<TrainerReview, UUID> {

    Page<TrainerReview> findAllByTrainerIdOrderByCreatedAtDesc(UUID trainerId, Pageable pageable);

    Optional<TrainerReview> findByTrainerIdAndMemberId(UUID trainerId, UUID memberId);

    @Query("SELECT AVG(r.rating) FROM TrainerReview r WHERE r.trainerId = :trainerId")
    Double getAverageRatingByTrainerId(@Param("trainerId") UUID trainerId);

    long countByTrainerId(UUID trainerId);
}
