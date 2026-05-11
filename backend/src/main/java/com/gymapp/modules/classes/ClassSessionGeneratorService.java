package com.gymapp.modules.classes;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassSessionGeneratorService {

    private final ClassScheduleRepository  scheduleRepository;
    private final ClassSessionRepository   sessionRepository;
    private final FitnessClassRepository   classRepository;

    @Transactional
    public void generateForSchedule(ClassSchedule schedule, LocalDate from, LocalDate until) {
        FitnessClass fc = classRepository.findById(schedule.getClassId()).orElse(null);
        if (fc == null) return;

        DayOfWeek target = DayOfWeek.of(schedule.getDayOfWeek());
        LocalDate cursor  = from;

        List<ClassSession> toSave = new ArrayList<>();
        while (!cursor.isAfter(until)) {
            if (cursor.getDayOfWeek() == target) {
                if (!sessionRepository.existsByScheduleIdAndSessionDate(schedule.getId(), cursor)) {
                    ClassSession s = new ClassSession();
                    s.setGymId(schedule.getGymId());
                    s.setClassId(schedule.getClassId());
                    s.setScheduleId(schedule.getId());
                    s.setSessionDate(cursor);
                    s.setStartTime(schedule.getStartTime());
                    LocalTime end = schedule.getStartTime().plusMinutes(fc.getDurationMinutes());
                    s.setEndTime(end);
                    s.setActualCapacity(schedule.getMaxCapacity());
                    s.setStatus(SessionStatus.SCHEDULED);
                    toSave.add(s);
                }
            }
            cursor = cursor.plusDays(1);
        }

        if (!toSave.isEmpty()) {
            sessionRepository.saveAll(toSave);
            log.info("Generated {} sessions for schedule {} (class: {})", toSave.size(), schedule.getId(), fc.getName());
        }
    }

    @Transactional
    public void generateNextNWeeks(FitnessClass fc, int weeks) {
        List<ClassSchedule> schedules = scheduleRepository.findAllByClassIdAndIsActiveTrue(fc.getId());
        LocalDate from  = LocalDate.now();
        LocalDate until = from.plusWeeks(weeks);
        for (ClassSchedule s : schedules) {
            generateForSchedule(s, from, until);
        }
    }

    @Scheduled(cron = "0 0 23 * * SUN")
    @Transactional
    public void generateWeeklyForAllGyms() {
        log.info("Running weekly session generation for all gyms...");
        LocalDate from  = LocalDate.now();
        LocalDate until = from.plusDays(7);
        List<ClassSchedule> all = scheduleRepository.findAll().stream()
            .filter(ClassSchedule::isActive)
            .toList();
        for (ClassSchedule s : all) {
            try {
                generateForSchedule(s, from, until);
            } catch (Exception e) {
                log.error("Failed to generate sessions for schedule {}: {}", s.getId(), e.getMessage());
            }
        }
    }
}
