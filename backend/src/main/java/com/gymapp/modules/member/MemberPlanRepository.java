package com.gymapp.modules.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberPlanRepository extends JpaRepository<MemberPlan, UUID> {

    List<MemberPlan> findAllByMemberIdAndGymId(UUID memberId, UUID gymId);
    Optional<MemberPlan> findByMemberIdAndGymIdAndStatus(UUID memberId, UUID gymId, MemberPlan.MemberPlanStatus status);
    List<MemberPlan> findAllByGymIdAndEndDateBeforeAndStatus(UUID gymId, LocalDate date, MemberPlan.MemberPlanStatus status);
    Optional<MemberPlan> findByIdAndGymId(UUID id, UUID gymId);
}
