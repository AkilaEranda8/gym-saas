package com.gymapp.modules.trainer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrainerCertificationScheduler {

    private final TrainerCertificationRepository certificationRepository;
    private final TrainerRepository              trainerRepository;
    private final TrainerNotificationService     notificationService;

    @Scheduled(cron = "0 0 9 * * *")
    public void checkExpiringCertifications() {
        LocalDate today  = LocalDate.now();
        LocalDate in7d   = today.plusDays(7);
        LocalDate in30d  = today.plusDays(30);

        List<TrainerCertification> expiredToday =
                certificationRepository.findAllByExpiryDateBefore(today);
        expiredToday.forEach(c -> {
            trainerRepository.findById(c.getTrainerId()).ifPresent(trainer ->
                notificationService.sendCertExpiryAlert(trainer, c, "🚨 EXPIRED"));
            log.warn("Certification EXPIRED: {} for trainer {}", c.getName(), c.getTrainerId());
        });

        List<TrainerCertification> expiring7d =
                certificationRepository.findAllByExpiryDateBetween(today, in7d);
        expiring7d.forEach(c ->
            trainerRepository.findById(c.getTrainerId()).ifPresent(trainer ->
                notificationService.sendCertExpiryAlert(trainer, c, "⚠️ Expiring in 7 days")));

        List<TrainerCertification> expiring30d =
                certificationRepository.findAllByExpiryDateBetween(in7d.plusDays(1), in30d);
        expiring30d.forEach(c ->
            trainerRepository.findById(c.getTrainerId()).ifPresent(trainer ->
                notificationService.sendCertExpiryAlert(trainer, c, "📅 Expiring in 30 days")));

        log.info("Cert expiry check: {} expired, {} in 7d, {} in 30d",
            expiredToday.size(), expiring7d.size(), expiring30d.size());
    }
}
