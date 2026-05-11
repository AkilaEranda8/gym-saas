package com.gymapp.modules.workout;

import com.gymapp.modules.workout.enums.AssignmentStatus;
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
public interface MemberWorkoutAssignmentRepository extends JpaRepository<MemberWorkoutAssignment, UUID> {

    Page<MemberWorkoutAssignment> findAllByGymIdOrderByCreatedAtDesc(UUID gymId, Pageable pageable);

    List<MemberWorkoutAssignment> findAllByGymIdAndMemberIdOrderByCreatedAtDesc(UUID gymId, UUID memberId);

    Optional<MemberWorkoutAssignment> findByIdAndGymId(UUID id, UUID gymId);

    Optional<MemberWorkoutAssignment> findFirstByGymIdAndMemberIdAndStatus(UUID gymId, UUID memberId, AssignmentStatus status);

    @Query("SELECT a FROM MemberWorkoutAssignment a WHERE a.gymId = :gymId AND a.plan.id = :planId ORDER BY a.createdAt DESC")
    Page<MemberWorkoutAssignment> findAllByGymIdAndPlanId(@Param("gymId") UUID gymId, @Param("planId") UUID planId, Pageable pageable);

    long countByGymIdAndStatus(UUID gymId, AssignmentStatus status);
}
