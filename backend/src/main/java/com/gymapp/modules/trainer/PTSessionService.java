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
public class PTSessionService {

    private final TrainerSessionRepository    sessionRepository;
    private final TrainerRepository           trainerRepository;
    private final TrainerAssignmentRepository assignmentRepository;
    private final MemberRepository            memberRepository;
    private final TrainerNotificationService  notificationService;
    private final TrainerService              trainerService;

    public Page<PTSessionDTO> getAll(UUID trainerId, UUID memberId,
                                      PTSessionStatus status, LocalDate from, LocalDate to,
                                      int page, int size) {
        UUID gymId   = TenantContext.getGymId();
        var  pageable = PageRequest.of(page, size, Sort.by("sessionDate").descending());
        return sessionRepository.findAllWithFilters(gymId, trainerId, status, from, to, pageable)
                .map(s -> {
                    Trainer t = trainerRepository.findById(s.getTrainerId()).orElse(null);
                    return trainerService.toPTSessionDTO(s, t != null ? t.getName() : "Unknown");
                });
    }

    @Transactional
    public PTSessionDTO create(CreatePTSessionRequest req) {
        UUID gymId = TenantContext.getGymId();

        Trainer trainer = trainerRepository.findByIdAndGymId(req.trainerId(), gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));
        memberRepository.findById(req.memberId())
                .orElseThrow(() -> new NoSuchElementException("Member not found"));

        if (sessionRepository.existsByTrainerIdAndSessionDateAndStartTimeLessThanAndEndTimeGreaterThan(
                req.trainerId(), req.sessionDate(), req.endTime(), req.startTime())) {
            throw new IllegalStateException("Trainer has a conflicting session at this time slot");
        }

        TrainerSession s = new TrainerSession();
        s.setGymId(gymId);
        s.setTrainerId(req.trainerId());
        s.setMemberId(req.memberId());
        s.setAssignmentId(req.assignmentId());
        s.setSessionDate(req.sessionDate());
        s.setStartTime(req.startTime());
        s.setEndTime(req.endTime());
        s.setNotes(req.notes());
        s.setStatus(PTSessionStatus.SCHEDULED);
        sessionRepository.save(s);

        memberRepository.findById(req.memberId()).ifPresent(member ->
            notificationService.sendSessionReminder(trainer, member, s));

        return trainerService.toPTSessionDTO(s, trainer.getName());
    }

    @Transactional
    public PTSessionDTO updateStatus(UUID sessionId, UpdateSessionStatusRequest req) {
        UUID gymId = TenantContext.getGymId();
        TrainerSession s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NoSuchElementException("Session not found"));
        if (!s.getGymId().equals(gymId))
            throw new IllegalStateException("Session not found in this gym");

        PTSessionStatus prev = s.getStatus();
        s.setStatus(req.status());
        if (req.trainerNotes()   != null) s.setTrainerNotes(req.trainerNotes());
        if (req.memberFeedback() != null) s.setMemberFeedback(req.memberFeedback());
        sessionRepository.save(s);

        if (prev == PTSessionStatus.SCHEDULED && req.status() == PTSessionStatus.COMPLETED) {
            assignmentRepository.findById(s.getAssignmentId() != null ? s.getAssignmentId() : UUID.randomUUID())
                    .ifPresent(a -> {
                        a.setSessionsUsed(a.getSessionsUsed() == null ? 1 : a.getSessionsUsed() + 1);
                        if (a.getSessionsUsed() >= (a.getSessionsTotal() != null ? a.getSessionsTotal() : 0)) {
                            a.setStatus(AssignmentStatus.COMPLETED);
                            memberRepository.findById(s.getMemberId()).ifPresent(member -> {
                                trainerRepository.findById(s.getTrainerId())
                                        .ifPresent(t -> notificationService.sendFeedbackRequest(member, t));
                            });
                        }
                        assignmentRepository.save(a);
                    });
        }

        Trainer t = trainerRepository.findById(s.getTrainerId()).orElse(null);
        return trainerService.toPTSessionDTO(s, t != null ? t.getName() : "Unknown");
    }

    @Transactional
    public void cancel(UUID sessionId, String reason) {
        UUID gymId = TenantContext.getGymId();
        TrainerSession s = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NoSuchElementException("Session not found"));
        if (!s.getGymId().equals(gymId))
            throw new IllegalStateException("Session not found in this gym");
        if (s.getStatus() == PTSessionStatus.COMPLETED)
            throw new IllegalStateException("Cannot cancel a completed session");
        s.setStatus(PTSessionStatus.CANCELLED);
        if (reason != null) s.setNotes(s.getNotes() != null ? s.getNotes() + "\nCancelled: " + reason : "Cancelled: " + reason);
        sessionRepository.save(s);
    }

    public Page<PTSessionDTO> getMemberSessions(UUID memberId, PTSessionStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("sessionDate").descending());
        Page<TrainerSession> sessions = status != null
            ? sessionRepository.findAllByMemberIdAndStatus(memberId, status, pageable)
            : sessionRepository.findAllByMemberId(memberId, pageable);
        return sessions.map(s -> {
            Trainer t = trainerRepository.findById(s.getTrainerId()).orElse(null);
            return trainerService.toPTSessionDTO(s, t != null ? t.getName() : "Unknown");
        });
    }

    public TrainerScheduleDTO getSchedule(UUID trainerId, LocalDate date) {
        return trainerService.getDaySchedule(trainerId, date);
    }
}
