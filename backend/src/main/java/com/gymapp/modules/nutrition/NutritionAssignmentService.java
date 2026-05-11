package com.gymapp.modules.nutrition;

import com.gymapp.modules.notification.NotificationService;
import com.gymapp.modules.notification.enums.NotificationType;
import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.modules.nutrition.enums.NutritionAssignmentStatus;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NutritionAssignmentService {

    private final MemberNutritionAssignmentRepository assignmentRepository;
    private final NutritionPlanRepository planRepository;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;

    public PageResponse<NutritionAssignmentDTO> listAssignments(NutritionAssignmentStatus status,
                                                                  UUID planId, int page, int size) {
        UUID gymId = TenantContext.getGymId();
        var pg = assignmentRepository.findAllByGymIdWithFilters(gymId, status, planId, PageRequest.of(page, size));
        return PageResponse.from(pg.map(a -> toAssignmentDTO(a, null)));
    }

    public NutritionAssignmentDTO getMemberActiveAssignment(UUID memberId) {
        Optional<MemberNutritionAssignment> assignment =
            assignmentRepository.findFirstByMemberIdAndStatus(memberId, NutritionAssignmentStatus.ACTIVE);
        return assignment.map(a -> toAssignmentDTO(a, null)).orElse(null);
    }

    @Transactional
    public NutritionAssignmentDTO assignPlan(AssignNutritionPlanRequest req) {
        UUID gymId = TenantContext.getGymId();
        UUID memberId = UUID.fromString(req.memberId());
        UUID planId   = UUID.fromString(req.planId());

        NutritionPlan plan = planRepository.findByIdAndGymId(planId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Nutrition plan not found"));

        assignmentRepository.findFirstByMemberIdAndStatus(memberId, NutritionAssignmentStatus.ACTIVE)
            .ifPresent(a -> {
                a.setStatus(NutritionAssignmentStatus.COMPLETED);
                a.setUpdatedAt(LocalDateTime.now());
                assignmentRepository.save(a);
            });

        MemberNutritionAssignment assignment = new MemberNutritionAssignment();
        assignment.setGymId(gymId);
        assignment.setMemberId(memberId);
        assignment.setPlanId(planId);
        assignment.setAssignedBy(currentUser.getEmail());
        assignment.setStartDate(req.startDate());
        assignment.setEndDate(req.endDate());
        assignment.setStatus(NutritionAssignmentStatus.ACTIVE);
        assignment.setTargetCalories(req.targetCalories() != null ? req.targetCalories() : plan.getCaloriesPerDay());
        assignment.setTargetProteinG(req.targetProteinG() != null ? req.targetProteinG() : plan.getProteinG());
        assignment.setTargetCarbsG(req.targetCarbsG() != null ? req.targetCarbsG() : plan.getCarbsG());
        assignment.setTargetFatG(req.targetFatG() != null ? req.targetFatG() : plan.getFatG());
        assignment.setNotes(req.notes());
        MemberNutritionAssignment saved = assignmentRepository.save(assignment);

        try {
            notificationService.send(gymId, memberId.toString(),
                "Nutrition Plan Assigned",
                "You have been assigned the \"" + plan.getName() + "\" nutrition plan.",
                NotificationType.NUTRITION_ASSIGNED,
                "/my-nutrition-plan");
        } catch (Exception ignored) {}

        return toAssignmentDTO(saved, plan);
    }

    @Transactional
    public NutritionAssignmentDTO updateStatus(UUID id, NutritionAssignmentStatus status) {
        UUID gymId = TenantContext.getGymId();
        MemberNutritionAssignment assignment = assignmentRepository.findById(id)
            .filter(a -> a.getGymId().equals(gymId))
            .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        assignment.setStatus(status);
        assignment.setUpdatedAt(LocalDateTime.now());
        return toAssignmentDTO(assignmentRepository.save(assignment), null);
    }

    private NutritionAssignmentDTO toAssignmentDTO(MemberNutritionAssignment a, NutritionPlan plan) {
        NutritionPlan p = plan != null ? plan : a.getPlan();
        return new NutritionAssignmentDTO(
            a.getId(), a.getGymId(), a.getMemberId(), a.getPlanId(),
            null, null,
            p != null ? p.getName() : null,
            p != null ? p.getGoal() : null,
            a.getAssignedBy(), a.getStartDate(), a.getEndDate(), a.getStatus(),
            a.getTargetCalories(), a.getTargetProteinG(), a.getTargetCarbsG(), a.getTargetFatG(),
            null, null, a.getNotes(), a.getCreatedAt()
        );
    }
}
