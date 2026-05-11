package com.gymapp.modules.reports;

import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.modules.trainer.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrainerPerformanceReportService {

    private final TrainerRepository          trainerRepository;
    private final TrainerSessionRepository   sessionRepository;
    private final TrainerAssignmentRepository assignmentRepository;
    private final TrainerReviewRepository    reviewRepository;

    @Transactional(readOnly = true)
    public TrainerPerformanceReportDTO generate(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();

        long total  = trainerRepository.countByGymIdAndDeletedAtIsNull(gymId);
        long active = trainerRepository.countByGymIdAndStatus(gymId, TrainerStatus.ACTIVE);

        List<Trainer> trainers = trainerRepository.findAllByGymIdAndStatus(gymId, TrainerStatus.ACTIVE);

        long totalCompleted  = 0, totalCancelled = 0, totalNoShow = 0;
        double sumRating = 0; int ratingCount = 0;

        List<TrainerStatDTO> stats = new java.util.ArrayList<>();
        for (Trainer t : trainers) {
            long comp     = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.COMPLETED);
            long canc     = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.CANCELLED);
            long noShow   = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.NO_SHOW);
            long clients  = assignmentRepository.countByTrainerIdAndStatus(t.getId(), AssignmentStatus.ACTIVE);
            long newPeriod = sessionRepository.countByTrainerIdAndSessionDateBetween(t.getId(), from, to);
            Double avgRat = reviewRepository.getAverageRatingByTrainerId(t.getId());
            double rating = avgRat != null ? avgRat : 0.0;
            long reviews  = reviewRepository.countByTrainerId(t.getId());
            double noShowRate = (comp + noShow) > 0 ? Math.round(noShow * 10000.0 / (comp + noShow)) / 100.0 : 0.0;

            totalCompleted  += comp;
            totalCancelled  += canc;
            totalNoShow     += noShow;
            if (rating > 0) { sumRating += rating; ratingCount++; }

            String specialty = (t.getSpecialties() != null && t.getSpecialties().length > 0)
                ? t.getSpecialties()[0] : "GENERAL";

            stats.add(new TrainerStatDTO(
                t.getId(), t.getName(), specialty,
                t.getEmploymentType() != null ? t.getEmploymentType().name() : "FULL_TIME",
                comp, canc, noShow, noShowRate,
                clients, newPeriod, rating, reviews,
                0L, comp > 0 ? 0L : 0L, 0L, 0.0
            ));
        }

        double avgPerTrainer = active > 0 ? (double) totalCompleted / active : 0.0;
        double avgRatingAll  = ratingCount > 0 ? Math.round(sumRating / ratingCount * 100.0) / 100.0 : 0.0;

        return new TrainerPerformanceReportDTO(
            from, to, total, active,
            totalCompleted + totalCancelled + totalNoShow,
            totalCompleted, totalCancelled, totalNoShow,
            avgPerTrainer, avgRatingAll, 0L, stats
        );
    }
}
