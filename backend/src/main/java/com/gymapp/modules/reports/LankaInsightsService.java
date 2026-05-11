package com.gymapp.modules.reports;

import com.gymapp.modules.member.AttendanceRepository;
import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LankaInsightsService {

    private final AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public LankaInsightsDTO generate() {
        UUID gymId = TenantContext.getGymId();
        int year = LocalDate.now().getYear();

        // Avurudu impact: compare April check-ins to March
        LocalDateTime marchFrom  = LocalDate.of(year, 3, 1).atStartOfDay();
        LocalDateTime marchTo    = LocalDate.of(year, 3, 31).atTime(23, 59, 59);
        LocalDateTime aprilFrom  = LocalDate.of(year, 4, 1).atStartOfDay();
        LocalDateTime aprilTo    = LocalDate.of(year, 4, 30).atTime(23, 59, 59);

        long marchCi = attendanceRepository.countByGymIdAndCheckInTimeBetween(gymId, marchFrom, marchTo);
        long aprilCi = attendanceRepository.countByGymIdAndCheckInTimeBetween(gymId, aprilFrom, aprilTo);
        double avuruduDrop = marchCi > 0 ? Math.round((marchCi - aprilCi) * 10000.0 / marchCi) / 100.0 : 0.0;

        // Build April daily data for chart
        List<DailyAttendanceDTO> aprilData = new ArrayList<>();
        for (LocalDate d = LocalDate.of(year, 4, 1); !d.isAfter(LocalDate.of(year, 4, 30)); d = d.plusDays(1)) {
            long cnt = attendanceRepository.countByGymIdAndCheckInTimeBetween(gymId, d.atStartOfDay(), d.atTime(23, 59, 59));
            aprilData.add(new DailyAttendanceDTO(d, d.getDayOfWeek().name(), cnt, false, isAvuruduHoliday(d)));
        }

        AvuruduImpactDTO avuruduImpact = new AvuruduImpactDTO(year, avuruduDrop, aprilData);

        // Seasonal monthly trends
        List<SeasonalTrendDTO> trends = new ArrayList<>();
        String[] monthNames = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        String[] seasons    = {"Low","Low","High","Low","High","High","High","High","High","High","High","Low"};
        for (int m = 1; m <= 12; m++) {
            LocalDateTime mFrom = LocalDate.of(year, m, 1).atStartOfDay();
            LocalDate mEnd = LocalDate.of(year, m, 1).withDayOfMonth(LocalDate.of(year, m, 1).lengthOfMonth());
            LocalDateTime mTo = mEnd.atTime(23, 59, 59);
            long ci = attendanceRepository.countByGymIdAndCheckInTimeBetween(gymId, mFrom, mTo);
            trends.add(new SeasonalTrendDTO(m, monthNames[m - 1], ci, 0.0, seasons[m - 1]));
        }

        return new LankaInsightsDTO(
            List.of("January", "May", "September", "October"),
            List.of("February", "November", "December"),
            avuruduImpact,
            8.5,
            "25th",
            12.0,
            68.0,
            trends
        );
    }

    private boolean isAvuruduHoliday(LocalDate d) {
        return d.getMonthValue() == 4 && (d.getDayOfMonth() == 13 || d.getDayOfMonth() == 14);
    }
}
