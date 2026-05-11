package com.gymapp.modules.trainer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainerAssignmentRepository extends JpaRepository<TrainerAssignment, UUID> {

    @Query("SELECT a FROM TrainerAssignment a WHERE a.gymId = :gymId "
         + "AND (:trainerId IS NULL OR a.trainerId = :trainerId) "
         + "AND (:memberId IS NULL OR a.memberId = :memberId) "
         + "AND (:status IS NULL OR a.status = :status)")
    Page<TrainerAssignment> findAllWithFilters(
            @Param("gymId") UUID gymId,
            @Param("trainerId") UUID trainerId,
            @Param("memberId") UUID memberId,
            @Param("status") AssignmentStatus status,
            Pageable pageable);

    List<TrainerAssignment> findAllByTrainerIdAndStatus(UUID trainerId, AssignmentStatus status);

    List<TrainerAssignment> findAllByMemberIdAndStatus(UUID memberId, AssignmentStatus status);

    Optional<TrainerAssignment> findByTrainerIdAndMemberIdAndStatusAndAssignmentType(
            UUID trainerId, UUID memberId, AssignmentStatus status, AssignmentType type);

    long countByTrainerIdAndStatus(UUID trainerId, AssignmentStatus status);

    Page<TrainerAssignment> findByGymIdAndStatus(UUID gymId, AssignmentStatus status, Pageable pageable);

    Optional<TrainerAssignment> findByIdAndGymId(UUID id, UUID gymId);
}
