package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.*;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.modules.trainer.TrainerRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassSessionService {

    private final ClassSessionRepository    sessionRepository;
    private final FitnessClassRepository    classRepository;
    private final ClassScheduleRepository   scheduleRepository;
    private final ClassBookingRepository    bookingRepository;
    private final ClassWaitlistRepository   waitlistRepository;
    private final ClassNotificationService  notificationService;
    private final MemberRepository          memberRepository;
    private final TrainerRepository         trainerRepository;

    public WeekScheduleDTO getWeekSchedule(LocalDate weekStart, UUID branchId) {
        UUID gymId  = TenantContext.getGymId();
        LocalDate from  = weekStart.with(DayOfWeek.MONDAY);
        LocalDate until = from.plusDays(6);

        List<ClassSession> sessions = sessionRepository.findByGymDateRangeBranch(gymId, from, until, branchId);

        Map<String, List<ClassSessionDTO>> days = new LinkedHashMap<>();
        for (DayOfWeek d : DayOfWeek.values()) {
            days.put(d.name(), new ArrayList<>());
        }

        for (ClassSession s : sessions) {
            FitnessClass fc = classRepository.findById(s.getClassId()).orElse(null);
            ClassSessionDTO dto = buildSessionDTO(s, fc);
            days.get(s.getSessionDate().getDayOfWeek().name()).add(dto);
        }

        return new WeekScheduleDTO(from, until, days);
    }

    public List<ClassSessionDTO> getDaySchedule(LocalDate date, UUID branchId) {
        UUID gymId = TenantContext.getGymId();
        return sessionRepository.findByGymDateBranch(gymId, date, branchId)
            .stream()
            .map(s -> buildSessionDTO(s, classRepository.findById(s.getClassId()).orElse(null)))
            .toList();
    }

    public ClassSessionDTO getSession(String sessionId) {
        UUID gymId = TenantContext.getGymId();
        ClassSession s = sessionRepository.findByIdAndGymId(UUID.fromString(sessionId), gymId)
            .orElseThrow(() -> new NoSuchElementException("Session not found"));
        FitnessClass fc = classRepository.findById(s.getClassId()).orElse(null);
        return buildSessionDTO(s, fc);
    }

    public List<ClassBookingDTO> getSessionBookings(String sessionId) {
        return bookingRepository.findAllBySessionId(UUID.fromString(sessionId))
            .stream().map(this::toBookingDTO).toList();
    }

    @Transactional
    public ClassSessionDTO createSession(CreateSessionRequest req) {
        UUID gymId = TenantContext.getGymId();
        FitnessClass fc = classRepository.findByIdAndGymId(req.classId(), gymId)
            .orElseThrow(() -> new NoSuchElementException("Class not found"));

        ClassSession s = new ClassSession();
        s.setGymId(gymId);
        s.setClassId(fc.getId());
        s.setTrainerId(req.trainerId() != null ? req.trainerId() : fc.getTrainerId());
        s.setSessionDate(req.sessionDate());
        s.setStartTime(req.startTime());
        s.setEndTime(req.startTime().plusMinutes(fc.getDurationMinutes()));
        s.setActualCapacity(req.actualCapacity() != null ? req.actualCapacity() : fc.getCapacity());
        s.setStatus(SessionStatus.SCHEDULED);
        s.setNotes(req.notes());
        sessionRepository.save(s);
        return buildSessionDTO(s, fc);
    }

    @Transactional
    public ClassSessionDTO updateSessionStatus(String sessionId, UpdateSessionStatusRequest req) {
        UUID gymId = TenantContext.getGymId();
        ClassSession s = sessionRepository.findByIdAndGymId(UUID.fromString(sessionId), gymId)
            .orElseThrow(() -> new NoSuchElementException("Session not found"));

        if (req.status() == SessionStatus.CANCELLED && (req.cancelReason() == null || req.cancelReason().isBlank())) {
            throw new IllegalArgumentException("Cancel reason is required when cancelling a session");
        }

        s.setStatus(req.status());
        if (req.notes() != null)        s.setNotes(req.notes());
        if (req.cancelReason() != null) s.setCancelReason(req.cancelReason());
        sessionRepository.save(s);

        if (req.status() == SessionStatus.CANCELLED) {
            FitnessClass fc = classRepository.findById(s.getClassId()).orElse(null);
            notifyAndCancelBookings(s, fc, req.cancelReason());
        }

        return buildSessionDTO(s, classRepository.findById(s.getClassId()).orElse(null));
    }

    @Transactional
    public List<ClassSessionDTO> getSessionsByClass(String classId, LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        FitnessClass fc = classRepository.findByIdAndGymId(UUID.fromString(classId), gymId)
            .orElseThrow(() -> new NoSuchElementException("Class not found"));
        return sessionRepository.findAllByClassIdAndSessionDateBetween(fc.getId(), from, to)
            .stream().map(s -> buildSessionDTO(s, fc)).toList();
    }

    public ClassStatsDTO getStats() {
        UUID gymId = TenantContext.getGymId();
        LocalDate now       = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd   = now.withDayOfMonth(now.lengthOfMonth());

        long totalClasses    = classRepository.countByGymId(gymId);
        long totalSessions   = sessionRepository.countByGymIdAndSessionDateBetween(gymId, monthStart, monthEnd);
        long cancelledSess   = sessionRepository.countByGymIdAndSessionDateBetweenAndStatus(gymId, monthStart, monthEnd, SessionStatus.CANCELLED);
        long totalBookings   = bookingRepository.countByGymIdAndBookedAtBetween(
            gymId,
            monthStart.atStartOfDay(),
            monthEnd.atTime(23, 59, 59));

        return new ClassStatsDTO(totalClasses, totalSessions, totalBookings, 0, null, null, cancelledSess);
    }

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void sendClassReminders() {
        LocalDateTime now    = LocalDateTime.now();
        LocalDateTime inHour = now.plusMinutes(60);

        List<ClassSession> upcoming = sessionRepository.findAll().stream()
            .filter(s -> s.getStatus() == SessionStatus.SCHEDULED)
            .filter(s -> {
                LocalDateTime start = s.getSessionDate().atTime(s.getStartTime());
                return !start.isBefore(now) && !start.isAfter(inHour);
            })
            .toList();

        for (ClassSession s : upcoming) {
            FitnessClass fc = classRepository.findById(s.getClassId()).orElse(null);
            if (fc == null) continue;
            bookingRepository.findAllBySessionIdAndStatus(s.getId(), BookingStatus.BOOKED)
                .forEach(b -> memberRepository.findById(b.getMemberId()).ifPresent(m ->
                    notificationService.sendClassReminder(m, s, fc)));
        }
    }

    private void notifyAndCancelBookings(ClassSession s, FitnessClass fc, String reason) {
        bookingRepository.findAllBySessionId(s.getId()).forEach(b -> {
            if (b.getStatus() == BookingStatus.BOOKED || b.getStatus() == BookingStatus.WAITLISTED) {
                b.setStatus(BookingStatus.CANCELLED);
                b.setCancelledAt(LocalDateTime.now());
                b.setCancelReason(reason);
                bookingRepository.save(b);
                if (fc != null) {
                    memberRepository.findById(b.getMemberId()).ifPresent(m ->
                        notificationService.sendSessionCancelledByGym(m, s, fc, reason));
                }
            }
        });
    }

    ClassSessionDTO buildSessionDTO(ClassSession s, FitnessClass fc) {
        int booked   = sessionRepository.countBookedBySessionId(s.getId());
        long waitCnt = waitlistRepository.countBySessionId(s.getId());
        s.setBookedCount(booked);
        s.setWaitlistCount((int) waitCnt);
        int fill = s.getActualCapacity() > 0
            ? (int) Math.round((booked * 100.0) / s.getActualCapacity()) : 0;

        String trainerName = resolveTrainerName(
            s.getTrainerId() != null ? s.getTrainerId() : (fc != null ? fc.getTrainerId() : null));

        return new ClassSessionDTO(
            s.getId(), s.getClassId(), s.getGymId(),
            fc != null ? fc.getName() : null,
            fc != null ? fc.getType() : null,
            fc != null ? fc.getColor() : null,
            trainerName,
            fc != null ? fc.getRoom() : null,
            s.getSessionDate(), s.getStartTime(), s.getEndTime(),
            fc != null ? fc.getDurationMinutes() : 0,
            s.getActualCapacity(), booked, s.getAvailableSlots(),
            waitCnt, s.getStatus(), fill, s.isFull(),
            false, null);
    }

    private ClassBookingDTO toBookingDTO(ClassBooking b) {
        String name  = memberRepository.findById(b.getMemberId())
            .map(m -> m.getFirstName() + " " + m.getLastName()).orElse(null);
        String phone = memberRepository.findById(b.getMemberId())
            .map(m -> m.getPhone()).orElse(null);
        return new ClassBookingDTO(
            b.getId(), b.getSessionId(), b.getMemberId(),
            name, phone, b.getStatus(), b.getBookedAt(),
            b.getCancelledAt(), b.getCancelReason(),
            b.getWaitlistPosition(), b.getAttendedAt());
    }

    private String resolveTrainerName(UUID trainerId) {
        if (trainerId == null) return null;
        return trainerRepository.findById(trainerId)
            .map(t -> t.getName())
            .orElse(null);
    }
}
