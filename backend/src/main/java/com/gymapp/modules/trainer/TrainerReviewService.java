package com.gymapp.modules.trainer;

import com.gymapp.modules.trainer.dto.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerReviewService {

    private final TrainerReviewRepository    reviewRepository;
    private final TrainerRepository          trainerRepository;
    private final TrainerService             trainerService;

    public Page<ReviewDTO> getReviews(UUID trainerId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reviewRepository.findAllByTrainerIdOrderByCreatedAtDesc(trainerId, pageable)
                .map(trainerService::toReviewDTO);
    }

    @Transactional
    public ReviewDTO addReview(UUID trainerId, AddReviewRequest req, UUID memberId) {
        UUID gymId = TenantContext.getGymId();
        Trainer t  = trainerRepository.findByIdAndGymId(trainerId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));

        reviewRepository.findByTrainerIdAndMemberId(trainerId, memberId)
                .ifPresent(r -> { throw new IllegalStateException("You have already reviewed this trainer"); });

        TrainerReview r = new TrainerReview();
        r.setGymId(gymId);
        r.setTrainerId(trainerId);
        r.setMemberId(memberId);
        r.setRating(req.rating());
        r.setReviewText(req.reviewText());
        r.setIsAnonymous(req.isAnonymous());
        reviewRepository.save(r);

        updateTrainerRating(t);
        return trainerService.toReviewDTO(r);
    }

    @Transactional
    public void deleteReview(UUID reviewId) {
        UUID gymId = TenantContext.getGymId();
        TrainerReview r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found"));
        if (!r.getGymId().equals(gymId))
            throw new IllegalStateException("Review not found in this gym");
        Trainer t = trainerRepository.findById(r.getTrainerId()).orElse(null);
        reviewRepository.delete(r);
        if (t != null) updateTrainerRating(t);
    }

    private void updateTrainerRating(Trainer t) {
        Double avg  = reviewRepository.getAverageRatingByTrainerId(t.getId());
        long   count = reviewRepository.countByTrainerId(t.getId());
        t.setRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        t.setTotalReviews((int) count);
        trainerRepository.save(t);
    }
}
