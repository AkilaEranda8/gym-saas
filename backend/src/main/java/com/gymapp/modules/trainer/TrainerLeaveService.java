package com.gymapp.modules.trainer;

import com.gymapp.modules.trainer.dto.ApproveLeaveRequest;
import com.gymapp.modules.trainer.dto.RequestLeaveRequest;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainerLeaveService {

    private final TrainerLeaveRepository     leaveRepository;
    private final TrainerRepository          trainerRepository;
    private final TrainerNotificationService notificationService;

    public record LeaveDTO(
        UUID id, UUID trainerId, String trainerName,
        LeaveType leaveType, LocalDate fromDate, LocalDate toDate,
        String reason, LeaveStatus status, String approvedBy,
        int daysCount
    ) {}

    public List<LeaveDTO> getAll(UUID gymId, LeaveStatus status) {
        return leaveRepository.findByGymIdAndStatus(gymId, status)
                .stream().map(this::toDTO).toList();
    }

    public List<LeaveDTO> getTrainerLeave(UUID trainerId) {
        return leaveRepository.findAllByTrainerIdOrderByFromDateDesc(trainerId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public LeaveDTO requestLeave(UUID trainerId, RequestLeaveRequest req) {
        UUID gymId = TenantContext.getGymId();
        trainerRepository.findByIdAndGymId(trainerId, gymId)
                .orElseThrow(() -> new NoSuchElementException("Trainer not found"));

        if (req.toDate().isBefore(req.fromDate()))
            throw new IllegalArgumentException("To date must be after from date");
        if (leaveRepository.existsConflictingLeave(trainerId, req.fromDate(), req.toDate()))
            throw new IllegalStateException("A leave request overlapping these dates already exists");

        TrainerLeave leave = new TrainerLeave();
        leave.setGymId(gymId);
        leave.setTrainerId(trainerId);
        leave.setLeaveType(req.leaveType());
        leave.setFromDate(req.fromDate());
        leave.setToDate(req.toDate());
        leave.setReason(req.reason());
        leave.setStatus(LeaveStatus.PENDING);
        leaveRepository.save(leave);
        return toDTO(leave);
    }

    @Transactional
    public LeaveDTO approveOrReject(UUID leaveId, ApproveLeaveRequest req, String approverName) {
        UUID gymId = TenantContext.getGymId();
        TrainerLeave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new NoSuchElementException("Leave request not found"));
        if (!leave.getGymId().equals(gymId))
            throw new IllegalStateException("Leave not found in this gym");
        if (leave.getStatus() != LeaveStatus.PENDING)
            throw new IllegalStateException("Leave request is already " + leave.getStatus().name().toLowerCase());

        leave.setStatus(req.status());
        leave.setApprovedBy(approverName);
        leaveRepository.save(leave);

        trainerRepository.findById(leave.getTrainerId()).ifPresent(trainer -> {
            boolean approved = req.status() == LeaveStatus.APPROVED;
            notificationService.sendLeaveApproval(trainer, leave, approved);
            if (approved) {
                trainer.setStatus(TrainerStatus.ON_LEAVE);
                trainerRepository.save(trainer);
            }
        });
        return toDTO(leave);
    }

    private LeaveDTO toDTO(TrainerLeave l) {
        String name  = trainerRepository.findById(l.getTrainerId())
                .map(Trainer::getName).orElse("Unknown");
        int days = (int) (l.getToDate().toEpochDay() - l.getFromDate().toEpochDay()) + 1;
        return new LeaveDTO(l.getId(), l.getTrainerId(), name,
            l.getLeaveType(), l.getFromDate(), l.getToDate(),
            l.getReason(), l.getStatus(), l.getApprovedBy(), days);
    }
}
