package com.gymapp.modules.settings.service;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.entity.HolidayConfig;
import com.gymapp.modules.settings.entity.OperatingHoursConfig;
import com.gymapp.modules.settings.repository.HolidayConfigRepository;
import com.gymapp.modules.settings.repository.OperatingHoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperatingHoursService {

    private final OperatingHoursRepository hoursRepo;
    private final HolidayConfigRepository holidayRepo;

    @Transactional(readOnly = true)
    public OperatingHoursDTO getHours(UUID gymId, UUID branchId) {
        List<OperatingHoursConfig> rows = branchId == null
            ? hoursRepo.findAllByGymIdAndBranchIdIsNull(gymId)
            : hoursRepo.findAllByGymIdAndBranchId(gymId, branchId);

        Map<Integer, OperatingHoursConfig> byDay = rows.stream()
            .collect(Collectors.toMap(OperatingHoursConfig::getDayOfWeek, r -> r));

        List<DayScheduleDTO> schedule = new ArrayList<>();
        for (int d = 1; d <= 7; d++) {
            OperatingHoursConfig cfg = byDay.get(d);
            schedule.add(new DayScheduleDTO(
                d, dayName(d),
                cfg != null && Boolean.TRUE.equals(cfg.getIsOpen()),
                cfg != null ? cfg.getOpenTime() : null,
                cfg != null ? cfg.getCloseTime() : null,
                cfg != null ? cfg.getNotes() : null
            ));
        }

        boolean openNow = isOpenNow(gymId, branchId);
        String nextOpen = openNow ? null : calculateNextOpenTime(schedule);
        return new OperatingHoursDTO(gymId, branchId, schedule, openNow, nextOpen);
    }

    @Transactional
    public void updateHours(UUID gymId, UUID branchId, UpdateOperatingHoursRequest req) {
        if (branchId == null) {
            hoursRepo.deleteAllByGymIdAndBranchIdIsNull(gymId);
        } else {
            hoursRepo.deleteAllByGymIdAndBranchId(gymId, branchId);
        }

        for (DayHoursRequest day : req.hours()) {
            OperatingHoursConfig cfg = new OperatingHoursConfig();
            cfg.setGymId(gymId);
            cfg.setBranchId(branchId);
            cfg.setDayOfWeek(day.dayOfWeek());
            cfg.setIsOpen(day.isOpen());
            if (day.isOpen()) {
                cfg.setOpenTime(day.openTime());
                cfg.setCloseTime(day.closeTime());
            }
            cfg.setNotes(day.notes());
            hoursRepo.save(cfg);
        }
    }

    public boolean isOpenNow(UUID gymId, UUID branchId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        if (isHoliday(gymId, today)) return false;

        int dow = now.getDayOfWeek().getValue();
        Optional<OperatingHoursConfig> cfg = branchId == null
            ? hoursRepo.findByGymIdAndBranchIdIsNullAndDayOfWeek(gymId, dow)
            : hoursRepo.findByGymIdAndBranchIdAndDayOfWeek(gymId, branchId, dow);

        return cfg.filter(c -> Boolean.TRUE.equals(c.getIsOpen()))
            .filter(c -> c.getOpenTime() != null && c.getCloseTime() != null)
            .map(c -> {
                LocalTime t = now.toLocalTime();
                return !t.isBefore(c.getOpenTime()) && t.isBefore(c.getCloseTime());
            })
            .orElse(false);
    }

    public boolean isHoliday(UUID gymId, LocalDate date) {
        return holidayRepo.findByGymIdAndHolidayDate(gymId, date)
            .filter(h -> Boolean.TRUE.equals(h.getIsClosed()))
            .isPresent();
    }

    @Transactional(readOnly = true)
    public List<HolidayDTO> getUpcomingHolidays(UUID gymId, int days) {
        LocalDate from = LocalDate.now();
        return holidayRepo.findAllByGymIdAndHolidayDateGreaterThanEqualOrderByHolidayDateAsc(gymId, from)
            .stream()
            .filter(h -> !h.getHolidayDate().isAfter(from.plusDays(days)))
            .map(this::toHolidayDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HolidayDTO> getAllHolidays(UUID gymId) {
        return holidayRepo.findAllByGymIdOrderByHolidayDateAsc(gymId).stream()
            .map(this::toHolidayDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public HolidayDTO createHoliday(UUID gymId, CreateHolidayRequest req) {
        HolidayConfig h = new HolidayConfig();
        h.setGymId(gymId);
        h.setName(req.name());
        h.setHolidayDate(req.holidayDate());
        h.setIsClosed(req.isClosed());
        h.setOpenTime(req.openTime());
        h.setCloseTime(req.closeTime());
        h.setNotes(req.notes());
        h.setIsRecurring(req.isRecurring());
        return toHolidayDto(holidayRepo.save(h));
    }

    @Transactional
    public void deleteHoliday(UUID gymId, UUID holidayId) {
        HolidayConfig h = holidayRepo.findById(holidayId)
            .orElseThrow(() -> new NoSuchElementException("Holiday not found"));
        if (!h.getGymId().equals(gymId))
            throw new IllegalArgumentException("Holiday does not belong to this gym");
        holidayRepo.delete(h);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String calculateNextOpenTime(List<DayScheduleDTO> schedule) {
        int today = LocalDate.now().getDayOfWeek().getValue();
        for (int offset = 1; offset <= 7; offset++) {
            int d = (today - 1 + offset) % 7 + 1;
            DayScheduleDTO day = schedule.stream()
                .filter(s -> s.dayOfWeek() == d)
                .findFirst().orElse(null);
            if (day != null && day.isOpen() && day.openTime() != null) {
                String dayStr = offset == 1 ? "Tomorrow" : dayName(d);
                return dayStr + " " + day.openTime();
            }
        }
        return null;
    }

    private String dayName(int dow) {
        return DayOfWeek.of(dow).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }

    HolidayDTO toHolidayDto(HolidayConfig h) {
        LocalDate today = LocalDate.now();
        return new HolidayDTO(
            h.getId(), h.getGymId(), h.getName(), h.getHolidayDate(),
            h.getIsClosed(), h.getOpenTime(), h.getCloseTime(),
            h.getNotes(), h.getIsRecurring(),
            h.getHolidayDate().equals(today),
            h.getHolidayDate().isBefore(today)
        );
    }
}
