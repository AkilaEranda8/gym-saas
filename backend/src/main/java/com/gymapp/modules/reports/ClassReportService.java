package com.gymapp.modules.reports;

import com.gymapp.modules.classes.ClassBookingRepository;
import com.gymapp.modules.classes.ClassSession;
import com.gymapp.modules.classes.ClassSessionRepository;
import com.gymapp.modules.classes.SessionStatus;
import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service("reportsClassReportService")
@RequiredArgsConstructor
public class ClassReportService {

    private final ClassSessionRepository sessionRepository;
    private final ClassBookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public ClassReportDTO generate(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();

        long total     = sessionRepository.countByGymIdAndSessionDateBetween(gymId, from, to);
        long cancelled = sessionRepository.countByGymIdAndSessionDateBetweenAndStatus(
                gymId, from, to, SessionStatus.CANCELLED);
        long completed = sessionRepository.countByGymIdAndSessionDateBetweenAndStatus(
                gymId, from, to, SessionStatus.COMPLETED);

        double cancelRate = total > 0 ? Math.round(cancelled * 10000.0 / total) / 100.0 : 0.0;
        long bookings = bookingRepository.countAttendedInPeriod(gymId, from, to);
        double avgFill = total > 0 ? Math.min(Math.round(bookings * 100.0 / (total * 20)) / 100.0, 100.0) : 0.0;

        // day-of-week breakdown
        List<ClassSession> sessions = sessionRepository.findAllByGymIdAndSessionDateBetween(gymId, from, to);
        Map<DayOfWeek, Long> byDay = sessions.stream()
            .collect(Collectors.groupingBy(s -> s.getSessionDate().getDayOfWeek(), Collectors.counting()));
        List<DaySessionStatDTO> dayStats = Arrays.stream(DayOfWeek.values())
            .map(d -> new DaySessionStatDTO(d.name(), byDay.getOrDefault(d, 0L), 0L, 0.0))
            .toList();

        return new ClassReportDTO(
            from, to, total, completed, cancelled, cancelRate,
            bookings, avgFill,
            null, 0L, null, 0L,
            List.of(), dayStats, List.of()
        );
    }
}
