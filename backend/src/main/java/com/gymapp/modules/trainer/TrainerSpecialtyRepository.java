package com.gymapp.modules.trainer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainerSpecialtyRepository extends JpaRepository<TrainerSpecialtyEntity, UUID> {

    List<TrainerSpecialtyEntity> findAllByTrainerId(UUID trainerId);

    Optional<TrainerSpecialtyEntity> findByTrainerIdAndSpecialty(UUID trainerId, TrainerSpecialty specialty);

    void deleteAllByTrainerId(UUID trainerId);
}
