package com.gymapp.modules.workout;

import com.gymapp.modules.workout.dto.WorkoutDtos.*;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkoutLogService {

    private final WorkoutLogRepository logRepository;
    private final WorkoutMapper mapper;

    public PageResponse<WorkoutLogResponse> listForMember(UUID memberId, int page, int size) {
        UUID gymId = TenantContext.getGymId();
        var pg = logRepository.findAllByGymIdAndMemberIdOrderByLogDateDesc(gymId, memberId, PageRequest.of(page, size));
        return PageResponse.from(pg.map(mapper::toLogResponse));
    }

    public PageResponse<WorkoutLogResponse> listAll(int page, int size) {
        var pg = logRepository.findAllByGymIdOrderByLogDateDesc(TenantContext.getGymId(), PageRequest.of(page, size));
        return PageResponse.from(pg.map(mapper::toLogResponse));
    }

    public WorkoutLogResponse get(UUID id) {
        return mapper.toLogResponse(
            logRepository.findByIdAndGymId(id, TenantContext.getGymId())
                .orElseThrow(() -> new NoSuchElementException("Workout log not found"))
        );
    }

    public List<WorkoutLogResponse> getRange(UUID memberId, LocalDate from, LocalDate to) {
        return logRepository.findAllByGymIdAndMemberIdAndLogDateBetweenOrderByLogDateDesc(
                TenantContext.getGymId(), memberId, from, to)
            .stream().map(mapper::toLogResponse).toList();
    }

    @Transactional
    public WorkoutLogResponse create(UUID memberId, CreateWorkoutLogRequest req) {
        UUID gymId = TenantContext.getGymId();
        WorkoutLog log = new WorkoutLog();
        log.setGymId(gymId);
        log.setMemberId(memberId);
        log.setAssignmentId(req.assignmentId());
        log.setPlanId(req.planId());
        log.setDayId(req.dayId());
        log.setLogDate(req.logDate());
        log.setStartedAt(req.startedAt());
        log.setCompletedAt(req.completedAt());
        log.setDurationMinutes(req.durationMinutes());
        log.setStatus(req.status());
        log.setOverallFeeling(req.overallFeeling());
        log.setNotes(req.notes());
        log = logRepository.save(log);

        if (req.setLogs() != null) {
            for (WorkoutSetLogRequest slr : req.setLogs()) {
                WorkoutSetLog sl = new WorkoutSetLog();
                sl.setGymId(gymId);
                sl.setWorkoutLog(log);
                sl.setWorkoutExerciseId(slr.workoutExerciseId());
                sl.setExerciseId(slr.exerciseId());
                sl.setSetNumber(slr.setNumber());
                sl.setRepsCompleted(slr.repsCompleted());
                sl.setWeightKg(slr.weightKg());
                sl.setDurationSeconds(slr.durationSeconds());
                sl.setRpeActual(slr.rpeActual());
                sl.setNotes(slr.notes());
                log.getSetLogs().add(sl);
            }
            log = logRepository.save(log);
        }
        return mapper.toLogResponse(log);
    }

    @Transactional
    public void delete(UUID id) {
        WorkoutLog log = logRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Workout log not found"));
        logRepository.delete(log);
    }

    public WorkoutStatsResponse getStats(UUID memberId) {
        UUID gymId = TenantContext.getGymId();
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        long sessions = logRepository.countSessionsSince(gymId, memberId, monthStart);
        long minutes = logRepository.totalMinutesSince(gymId, memberId, monthStart);
        return new WorkoutStatsResponse(0, 0, sessions, minutes, 0);
    }
}
