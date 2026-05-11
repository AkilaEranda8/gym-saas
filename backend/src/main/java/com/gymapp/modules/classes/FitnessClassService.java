package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.*;
import com.gymapp.modules.trainer.Trainer;
import com.gymapp.modules.trainer.TrainerRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FitnessClassService {

    private final FitnessClassRepository       classRepository;
    private final ClassScheduleRepository      scheduleRepository;
    private final ClassSessionRepository       sessionRepository;
    private final ClassBookingRepository       bookingRepository;
    private final ClassSessionGeneratorService generatorService;
    private final TrainerRepository            trainerRepository;

    public Page<FitnessClassDTO> getAll(int page, int size, ClassType type,
                                         UUID trainerId, UUID branchId) {
        UUID gymId   = TenantContext.getGymId();
        Pageable pbl = PageRequest.of(page, size, Sort.by("name"));
        return classRepository.findAllByGymIdWithFilters(gymId, type, trainerId, branchId, pbl)
            .map(this::toDTO);
    }

    @Transactional
    public FitnessClassDTO create(CreateClassRequest req) {
        UUID gymId = TenantContext.getGymId();

        FitnessClass fc = new FitnessClass();
        fc.setGymId(gymId);
        fc.setName(req.name());
        fc.setDescription(req.description());
        fc.setType(req.type());
        fc.setTrainerId(req.trainerId());
        fc.setBranchId(req.branchId());
        fc.setRoom(req.room());
        fc.setCapacity(req.capacity());
        fc.setDurationMinutes(req.durationMinutes());
        fc.setDifficulty(req.difficulty() != null ? req.difficulty() : ClassDifficulty.ALL_LEVELS);
        fc.setColor(req.type().getColor());
        fc.setRecurring(req.isRecurring());
        fc = classRepository.save(fc);

        if (req.schedules() != null && !req.schedules().isEmpty()) {
            for (CreateScheduleRequest sr : req.schedules()) {
                addScheduleInternal(fc, sr, gymId);
            }
        }

        if (req.isRecurring()) {
            generatorService.generateNextNWeeks(fc, 4);
        }

        return toDTO(fc);
    }

    public ClassDetailDTO getById(String id) {
        UUID gymId = TenantContext.getGymId();
        FitnessClass fc = classRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Class not found"));

        List<ClassScheduleDTO> schedules = scheduleRepository
            .findAllByClassIdAndIsActiveTrue(fc.getId())
            .stream().map(this::toScheduleDTO).toList();

        LocalDate now   = LocalDate.now();
        LocalDate until = now.plusDays(7);
        List<ClassSessionDTO> upcoming = sessionRepository
            .findAllByClassIdAndSessionDateBetween(fc.getId(), now, until)
            .stream()
            .filter(s -> s.getStatus() == SessionStatus.SCHEDULED)
            .map(s -> toSessionDTO(s, fc, null, null))
            .toList();

        return new ClassDetailDTO(
            fc.getId(), fc.getGymId(), fc.getBranchId(), fc.getTrainerId(),
            resolveTrainerName(fc.getTrainerId()),
            fc.getName(), fc.getDescription(), fc.getType(), fc.getRoom(),
            fc.getCapacity(), fc.getDurationMinutes(), fc.getDifficulty(),
            fc.getColor(), fc.isRecurring(), schedules, upcoming, 0, 0.0);
    }

    @Transactional
    public FitnessClassDTO update(String id, UpdateClassRequest req) {
        UUID gymId = TenantContext.getGymId();
        FitnessClass fc = classRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Class not found"));

        if (req.name()            != null) fc.setName(req.name());
        if (req.description()     != null) fc.setDescription(req.description());
        if (req.type()            != null) { fc.setType(req.type()); fc.setColor(req.type().getColor()); }
        if (req.trainerId()       != null) fc.setTrainerId(req.trainerId());
        if (req.branchId()        != null) fc.setBranchId(req.branchId());
        if (req.room()            != null) fc.setRoom(req.room());
        if (req.capacity()        != null) fc.setCapacity(req.capacity());
        if (req.durationMinutes() != null) fc.setDurationMinutes(req.durationMinutes());
        if (req.difficulty()      != null) fc.setDifficulty(req.difficulty());
        if (req.isRecurring()     != null) fc.setRecurring(req.isRecurring());

        return toDTO(classRepository.save(fc));
    }

    @Transactional
    public void delete(String id) {
        UUID gymId = TenantContext.getGymId();
        FitnessClass fc = classRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Class not found"));

        fc.setDeletedAt(LocalDateTime.now());
        classRepository.save(fc);

        LocalDate today = LocalDate.now();
        sessionRepository
            .findAllByClassIdAndSessionDateBetween(fc.getId(), today, today.plusYears(1))
            .stream()
            .filter(s -> s.getStatus() == SessionStatus.SCHEDULED)
            .forEach(s -> {
                s.setStatus(SessionStatus.CANCELLED);
                s.setCancelReason("Class deleted");
                sessionRepository.save(s);
                cancelSessionBookings(s);
            });

        log.info("Soft-deleted class {} and cancelled future sessions", fc.getName());
    }

    @Transactional
    public ClassScheduleDTO addSchedule(String classId, CreateScheduleRequest req) {
        UUID gymId = TenantContext.getGymId();
        FitnessClass fc = classRepository.findByIdAndGymId(UUID.fromString(classId), gymId)
            .orElseThrow(() -> new NoSuchElementException("Class not found"));

        ClassSchedule saved = addScheduleInternal(fc, req, gymId);
        generatorService.generateForSchedule(saved, LocalDate.now(), LocalDate.now().plusWeeks(4));
        return toScheduleDTO(saved);
    }

    @Transactional
    public void removeSchedule(String scheduleId) {
        ClassSchedule schedule = scheduleRepository.findById(UUID.fromString(scheduleId))
            .orElseThrow(() -> new NoSuchElementException("Schedule not found"));

        schedule.setActive(false);
        scheduleRepository.save(schedule);

        sessionRepository
            .findAllByScheduleIdAndSessionDateGreaterThanEqual(schedule.getId(), LocalDate.now())
            .stream()
            .filter(s -> s.getStatus() == SessionStatus.SCHEDULED)
            .forEach(s -> {
                s.setStatus(SessionStatus.CANCELLED);
                s.setCancelReason("Schedule removed");
                sessionRepository.save(s);
                cancelSessionBookings(s);
            });
    }

    private ClassSchedule addScheduleInternal(FitnessClass fc, CreateScheduleRequest req, UUID gymId) {
        ClassSchedule cs = new ClassSchedule();
        cs.setGymId(gymId);
        cs.setClassId(fc.getId());
        cs.setDayOfWeek(req.dayOfWeek());
        cs.setStartTime(req.startTime());
        cs.setEndTime(req.startTime().plusMinutes(fc.getDurationMinutes()));
        cs.setMaxCapacity(req.maxCapacity());
        cs.setActive(true);
        cs.setEffectiveFrom(LocalDate.now());
        return scheduleRepository.save(cs);
    }

    private void cancelSessionBookings(ClassSession session) {
        bookingRepository.findAllBySessionIdAndStatus(session.getId(), BookingStatus.BOOKED)
            .forEach(b -> {
                b.setStatus(BookingStatus.CANCELLED);
                b.setCancelledAt(LocalDateTime.now());
                b.setCancelReason("Class cancelled");
                bookingRepository.save(b);
            });
    }

    private FitnessClassDTO toDTO(FitnessClass fc) {
        long total  = scheduleRepository.findAllByClassIdAndIsActiveTrue(fc.getId()).size();
        return new FitnessClassDTO(
            fc.getId(), fc.getGymId(), fc.getBranchId(), fc.getTrainerId(),
            resolveTrainerName(fc.getTrainerId()),
            fc.getName(), fc.getDescription(), fc.getType(), fc.getRoom(),
            fc.getCapacity(), fc.getDurationMinutes(), fc.getDifficulty(),
            fc.getColor(), fc.isRecurring(), total, total);
    }

    ClassScheduleDTO toScheduleDTO(ClassSchedule cs) {
        return new ClassScheduleDTO(
            cs.getId(), cs.getClassId(), cs.getDayOfWeek(),
            ClassScheduleDTO.toDayName(cs.getDayOfWeek()),
            cs.getStartTime(), cs.getEndTime(),
            cs.getMaxCapacity(), cs.isActive(),
            cs.getEffectiveFrom(), cs.getEffectiveUntil());
    }

    ClassSessionDTO toSessionDTO(ClassSession s, FitnessClass fc, String currentUserId, ClassBookingRepository bookingRepo) {
        int booked  = sessionRepository.countBookedBySessionId(s.getId());
        s.setBookedCount(booked);
        long waitlist = 0;
        int fill = s.getActualCapacity() > 0
            ? (int) ((booked * 100.0) / s.getActualCapacity()) : 0;
        return new ClassSessionDTO(
            s.getId(), s.getClassId(), s.getGymId(),
            fc != null ? fc.getName() : null,
            fc != null ? fc.getType() : null,
            fc != null ? fc.getColor() : null,
            fc != null ? resolveTrainerName(s.getTrainerId() != null ? s.getTrainerId() : (fc.getTrainerId())) : null,
            fc != null ? fc.getRoom() : null,
            s.getSessionDate(), s.getStartTime(), s.getEndTime(),
            fc != null ? fc.getDurationMinutes() : 0,
            s.getActualCapacity(), booked, s.getAvailableSlots(),
            waitlist, s.getStatus(), fill, s.isFull(),
            false, null);
    }

    private String resolveTrainerName(UUID trainerId) {
        if (trainerId == null) return null;
        return trainerRepository.findById(trainerId)
            .map(t -> t.getName())
            .orElse(null);
    }
}
