package com.gymapp.modules.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SupplementScheduleRepository extends JpaRepository<SupplementSchedule, UUID> {

    List<SupplementSchedule> findAllByMemberIdAndActiveTrue(UUID memberId);

    List<SupplementSchedule> findAllByAssignmentId(UUID assignmentId);

    List<SupplementSchedule> findAllByMemberId(UUID memberId);
}
