package com.gymapp.modules.locker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LockerAssignmentRepository extends JpaRepository<LockerAssignment, UUID> {

    Optional<LockerAssignment> findByLockerIdAndStatus(UUID lockerId, LockerAssignment.AssignmentStatus status);
    List<LockerAssignment> findAllByMemberIdAndGymId(UUID memberId, UUID gymId);
    Optional<LockerAssignment> findByIdAndGymId(UUID id, UUID gymId);
    List<LockerAssignment> findAllByGymId(UUID gymId);
    List<LockerAssignment> findAllByGymIdAndStatus(UUID gymId, LockerAssignment.AssignmentStatus status);
    long countByGymIdAndStatus(UUID gymId, LockerAssignment.AssignmentStatus status);

    @Query("SELECT a FROM LockerAssignment a WHERE a.gymId = :gymId AND a.status = 'ACTIVE' AND a.endDate BETWEEN :from AND :to")
    List<LockerAssignment> findExpiringBetween(@Param("gymId") UUID gymId,
                                               @Param("from") LocalDate from,
                                               @Param("to") LocalDate to);
}
