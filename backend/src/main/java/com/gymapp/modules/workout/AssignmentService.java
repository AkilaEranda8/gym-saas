package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.modules.workout.enums.AssignmentStatus;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final MemberWorkoutAssignmentRepository assignmentRepository;
    private final WorkoutPlanRepository planRepository;
    private final WorkoutMapper mapper;
    private final CurrentUser currentUser;

    public PageResponse<AssignmentResponse> list(int page, int size) {
        UUID gymId = TenantContext.getGymId();
        var pg = assignmentRepository.findAllByGymIdOrderByCreatedAtDesc(gymId, PageRequest.of(page, size));
        return PageResponse.from(pg.map(mapper::toAssignmentResponse));
    }

    public List<AssignmentResponse> listForMember(UUID memberId) {
        return assignmentRepository
            .findAllByGymIdAndMemberIdOrderByCreatedAtDesc(TenantContext.getGymId(), memberId)
            .stream().map(mapper::toAssignmentResponse).toList();
    }

    public AssignmentResponse getActive(UUID memberId) {
        return assignmentRepository
            .findFirstByGymIdAndMemberIdAndStatus(TenantContext.getGymId(), memberId, AssignmentStatus.ACTIVE)
            .map(mapper::toAssignmentResponse)
            .orElse(null);
    }

    public AssignmentResponse get(UUID id) {
        return mapper.toAssignmentResponse(
            assignmentRepository.findByIdAndGymId(id, TenantContext.getGymId())
                .orElseThrow(() -> new NoSuchElementException("Assignment not found"))
        );
    }

    @Transactional
    public AssignmentResponse assign(AssignWorkoutRequest req) {
        UUID gymId = TenantContext.getGymId();
        WorkoutPlan plan = planRepository.findByIdAndGymIdAndDeletedAtIsNull(req.planId(), gymId)
            .orElseThrow(() -> new NoSuchElementException("Workout plan not found"));

        assignmentRepository.findFirstByGymIdAndMemberIdAndStatus(gymId, req.memberId(), AssignmentStatus.ACTIVE)
            .ifPresent(a -> {
                a.setStatus(AssignmentStatus.CANCELLED);
                assignmentRepository.save(a);
            });

        MemberWorkoutAssignment assignment = new MemberWorkoutAssignment();
        assignment.setGymId(gymId);
        assignment.setMemberId(req.memberId());
        assignment.setPlan(plan);
        assignment.setAssignedBy(currentUser.getEmail());
        assignment.setStartDate(req.startDate());
        assignment.setEndDate(req.endDate());
        assignment.setNotes(req.notes());
        assignment.setStatus(AssignmentStatus.ACTIVE);
        return mapper.toAssignmentResponse(assignmentRepository.save(assignment));
    }

    @Transactional
    public AssignmentResponse updateStatus(UUID id, UpdateAssignmentStatusRequest req) {
        MemberWorkoutAssignment a = assignmentRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        a.setStatus(req.status());
        a.setUpdatedAt(LocalDateTime.now());
        return mapper.toAssignmentResponse(assignmentRepository.save(a));
    }

    @Transactional
    public void delete(UUID id) {
        MemberWorkoutAssignment a = assignmentRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        a.setStatus(AssignmentStatus.CANCELLED);
        a.setUpdatedAt(LocalDateTime.now());
        assignmentRepository.save(a);
    }
}
