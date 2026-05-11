package com.gymapp.modules.reports;

import com.gymapp.modules.member.Attendance;
import com.gymapp.modules.member.AttendanceRepository;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceReportService {

    private final AttendanceRepository attendanceRepository;
    private final MemberRepository     memberRepository;

    @Transactional(readOnly = true)
    public AttendanceReportDTO generate(LocalDate from, LocalDate to, String branchId) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo   = to.atTime(23, 59, 59);

        long totalCheckIns = attendanceRepository.countByGymIdAndCheckInTimeBetween(gymId, dtFrom, dtTo);
        long days          = ChronoUnit.DAYS.between(from, to) + 1;
        double avgDaily    = days > 0 ? Math.round(totalCheckIns * 100.0 / days) / 100.0 : 0.0;

        Map<Integer, Long> hourlyHeatmap = getHourlyHeatmap(from, to);
        Map<String, Long>  dailyMap      = getDailyHeatmap(from, to);

        int    peakHourInt = hourlyHeatmap.entrySet().stream()
            .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(18);
        String peakHour = formatHour(peakHourInt);

        String peakDay = dailyMap.entrySet().stream()
            .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("Monday");

        // Build daily attendance list
        List<DailyAttendanceDTO> dailyList = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            LocalDateTime ds = d.atStartOfDay();
            LocalDateTime de = d.atTime(23, 59, 59);
            long cnt = attendanceRepository.countByGymIdAndCheckInTimeBetween(gymId, ds, de);
            boolean weekend = d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean holiday = isSriLankanHoliday(d);
            dailyList.add(new DailyAttendanceDTO(d, d.getDayOfWeek().name(), cnt, weekend, holiday));
        }

        return new AttendanceReportDTO(
            from, to, totalCheckIns, 0L, avgDaily,
            peakHour, peakDay, null, 0.0,
            hourlyHeatmap, dailyList, List.of(), List.of(), List.of()
        );
    }

    @Transactional(readOnly = true)
    public Map<Integer, Long> getHourlyHeatmap(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        Map<Integer, Long> map = new LinkedHashMap<>();
        for (int h = 0; h <= 23; h++) map.put(h, 0L);
        List<Object[]> rows = attendanceRepository.findHourlyAttendance(gymId, from.atStartOfDay(), to.atTime(23, 59, 59));
        for (Object[] row : rows) {
            int hour  = ((Number) row[0]).intValue();
            long cnt  = ((Number) row[1]).longValue();
            map.put(hour, cnt);
        }
        return map;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getDailyHeatmap(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        Map<String, Long> map = new LinkedHashMap<>();
        for (DayOfWeek d : DayOfWeek.values()) map.put(d.name(), 0L);
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo   = to.atTime(23, 59, 59);
        long total = attendanceRepository.countByGymIdAndCheckInTimeBetween(gymId, dtFrom, dtTo);
        return map;
    }

    private String formatHour(int h) {
        if (h == 0)  return "12:00 AM";
        if (h < 12)  return h + ":00 AM";
        if (h == 12) return "12:00 PM";
        return (h - 12) + ":00 PM";
    }

    private boolean isSriLankanHoliday(LocalDate d) {
        int m = d.getMonthValue(), day = d.getDayOfMonth();
        return (m == 1 && day == 1) || (m == 2 && day == 4)
            || (m == 4 && (day == 13 || day == 14))
            || (m == 5 && day == 1) || (m == 12 && day == 25);
    }
}
