package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.enums.NutritionAssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberNutritionAssignmentRepository extends JpaRepository<MemberNutritionAssignment, UUID> {

    Optional<MemberNutritionAssignment> findFirstByMemberIdAndStatus(UUID memberId, NutritionAssignmentStatus status);

    Page<MemberNutritionAssignment> findAllByMemberIdOrderByCreatedAtDesc(UUID memberId, Pageable pageable);

    List<MemberNutritionAssignment> findAllByPlanIdAndStatus(UUID planId, NutritionAssignmentStatus status);

    long countByGymIdAndStatus(UUID gymId, NutritionAssignmentStatus status);

    boolean existsByMemberIdAndPlanIdAndStatus(UUID memberId, UUID planId, NutritionAssignmentStatus status);

    @Query("SELECT a FROM MemberNutritionAssignment a WHERE a.gymId = :gymId ORDER BY a.createdAt DESC")
    Page<MemberNutritionAssignment> findAllByGymId(@Param("gymId") UUID gymId, Pageable pageable);

    @Query("""
        SELECT a FROM MemberNutritionAssignment a
        WHERE a.gymId = :gymId
          AND (:status IS NULL OR a.status = :status)
          AND (:planId IS NULL OR a.planId = :planId)
        ORDER BY a.createdAt DESC
        """)
    Page<MemberNutritionAssignment> findAllByGymIdWithFilters(
        @Param("gymId") UUID gymId,
        @Param("status") NutritionAssignmentStatus status,
        @Param("planId") UUID planId,
        Pageable pageable);
}
