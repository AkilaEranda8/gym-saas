package com.gymapp.modules.trainer;

import com.gymapp.modules.member.MemberRepository;
import com.gymapp.modules.trainer.dto.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainerAssignmentService {

    private final TrainerAssignmentRepository assignmentRepository;
    private final TrainerRepository           trainerRepository;
    private final MemberRepository            memberRepository;
    private final TrainerNotificationService  notificationService;
    private final TrainerService              trainerService;

    public Page<AssignmentDTO> getAll(UUID trainerId, UUID memberId,
                                       AssignmentStatus status, int page, int size) {
        UUID gymId   = TenantContext.getGymId();
        var  pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return assignmentRepository.findAllWithFilters(gymId, trainerId, memberId, status, pageable)
                .map(a -> {
                    Trainer t = trainerRepository.findById(a.getTrainerId()).orElse(null);
                    return trainerService.toAssignmentDTO(a, t != null ? t.getName() : "Unknown");
                });
    }

    public AssignmentDTO getById(UUID id) {
        UUID gymId = TenantContext.getGymId();
        TrainerAssignment a = assignmentRepository.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        Trainer t = trainerRepository.findById(a.getTrainerId()).orElse(null);
        return trainerService.toAssignmentDTO(a, t != null ? t.getName() : "Unknown");
    }

    @Transactional
    public AssignmentDTO create(CreateAssignmentRequest req) {
        UUID gymId = TenantContext.getGymId();
        Trainer trainer = trainerRepository.findByIdAndGymId(req.trainerId(), gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));
        if (trainer.getStatus() != TrainerStatus.ACTIVE)
            throw new IllegalStateException("Trainer is not active");
        memberRepository.findById(req.memberId())
                .orElseThrow(() -> new NoSuchElementException("Member not found"));

        assignmentRepository.findByTrainerIdAndMemberIdAndStatusAndAssignmentType(
                req.trainerId(), req.memberId(), AssignmentStatus.ACTIVE, req.assignmentType())
                .ifPresent(a -> { throw new IllegalStateException("Active assignment already exists for this trainer-member-type combination"); });

        TrainerAssignment a = new TrainerAssignment();
        a.setGymId(gymId);
        a.setTrainerId(req.trainerId());
        a.setMemberId(req.memberId());
        a.setAssignmentType(req.assignmentType());
        a.setStatus(AssignmentStatus.ACTIVE);
        a.setStartedDate(req.startedDate());
        a.setSessionsTotal(req.sessionsTotal());
        a.setSessionsUsed(0);
        a.setNotes(req.notes());
        assignmentRepository.save(a);

        memberRepository.findById(req.memberId()).ifPresent(member ->
            notificationService.sendAssignmentNotification(trainer, member, req.assignmentType()));

        return trainerService.toAssignmentDTO(a, trainer.getName());
    }

    @Transactional
    public AssignmentDTO complete(UUID assignmentId) {
        UUID gymId = TenantContext.getGymId();
        TrainerAssignment a = assignmentRepository.findByIdAndGymId(assignmentId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        a.setStatus(AssignmentStatus.COMPLETED);
        a.setEndedDate(LocalDate.now());
        assignmentRepository.save(a);

        memberRepository.findById(a.getMemberId()).ifPresent(member -> {
            Trainer t = trainerRepository.findById(a.getTrainerId()).orElse(null);
            if (t != null) notificationService.sendFeedbackRequest(member, t);
        });

        Trainer t = trainerRepository.findById(a.getTrainerId()).orElse(null);
        return trainerService.toAssignmentDTO(a, t != null ? t.getName() : "Unknown");
    }

    @Transactional
    public AssignmentDTO cancel(UUID assignmentId, String reason) {
        UUID gymId = TenantContext.getGymId();
        TrainerAssignment a = assignmentRepository.findByIdAndGymId(assignmentId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Assignment not found"));
        a.setStatus(AssignmentStatus.CANCELLED);
        a.setEndedDate(LocalDate.now());
        if (reason != null) a.setNotes(a.getNotes() != null ? a.getNotes() + "\nCancelled: " + reason : "Cancelled: " + reason);
        assignmentRepository.save(a);
        Trainer t = trainerRepository.findById(a.getTrainerId()).orElse(null);
        return trainerService.toAssignmentDTO(a, t != null ? t.getName() : "Unknown");
    }
}
