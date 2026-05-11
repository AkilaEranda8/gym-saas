package com.gymapp.modules.trainer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerCertificationRepository extends JpaRepository<TrainerCertification, UUID> {

    List<TrainerCertification> findAllByTrainerId(UUID trainerId);

    List<TrainerCertification> findByTrainerIdAndIsVerifiedFalse(UUID trainerId);

    List<TrainerCertification> findAllByExpiryDateBefore(LocalDate date);

    List<TrainerCertification> findAllByExpiryDateBetween(LocalDate from, LocalDate to);
}
