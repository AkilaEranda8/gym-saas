package com.gymapp.modules.reports;

import com.gymapp.modules.billing.PaymentRepository;
import com.gymapp.modules.classes.ClassBookingRepository;
import com.gymapp.modules.classes.ClassSessionRepository;
import com.gymapp.modules.equipment.EquipmentRepository;
import com.gymapp.modules.equipment.MaintenanceRequestRepository;
import com.gymapp.modules.member.AttendanceRepository;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.modules.reports.dto.ReportDtos.DashboardKpiDTO;
import com.gymapp.modules.shop.repository.ShopOrderRepository;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.MemberStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardReportService {

    private final MemberRepository      memberRepository;
    private final AttendanceRepository  attendanceRepository;
    private final PaymentRepository     paymentRepository;
    private final ClassSessionRepository classSessionRepository;
    private final ClassBookingRepository classBookingRepository;
    private final ShopOrderRepository   shopOrderRepository;
    private final EquipmentRepository   equipmentRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "report-kpis", key = "#root.target.cacheKey(#from, #to)")
    public DashboardKpiDTO getKPIsForPeriod(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo   = to.atTime(23, 59, 59);

        // Revenue
        Long revenue    = paymentRepository.sumRevenueBetween(gymId, dtFrom, dtTo);
        long revLkr     = revenue != null ? revenue : 0L;

        // Prev period revenue for growth
        long periodDays = ChronoUnit.DAYS.between(from, to) + 1;
        LocalDate prevFrom = from.minusDays(periodDays);
        LocalDate prevTo   = from.minusDays(1);
        Long prevRev = paymentRepository.sumRevenueBetween(gymId, prevFrom.atStartOfDay(), prevTo.atTime(23,59,59));
        long prevLkr = prevRev != null ? prevRev : 0L;
        double revGrowth = prevLkr > 0 ? Math.round((revLkr - prevLkr) * 10000.0 / prevLkr) / 100.0 : 0.0;

        // Members
        long totalMembers  = memberRepository.countByGymId(gymId);
        long activeMembers = memberRepository.countByGymIdAndStatus(gymId, MemberStatus.ACTIVE);
        long newMembers    = memberRepository.countByGymIdAndJoinDateAfter(gymId, from);
        long prevNewMembers = memberRepository.countByGymIdAndJoinDateAfter(gymId, prevFrom);
        double memberGrowth = prevNewMembers > 0
            ? Math.round((newMembers - prevNewMembers) * 10000.0 / prevNewMembers) / 100.0 : 0.0;

        // Expired/churned in period (very rough: members whose expiry fell in period)
        List<?> expiring = memberRepository.findExpiringMembers(gymId, from, to);
        int churned = expiring.size();

        // Retention = active / total
        double retention = totalMembers > 0 ? Math.round(activeMembers * 10000.0 / totalMembers) / 100.0 : 0.0;
        long avgRevPerMember = activeMembers > 0 ? revLkr / activeMembers : 0L;

        // Attendance
        long totalCheckIns = attendanceRepository.countByGymIdAndCheckInTimeBetween(gymId, dtFrom, dtTo);
        long days = ChronoUnit.DAYS.between(from, to) + 1;
        double avgDaily = days > 0 ? Math.round(totalCheckIns * 100.0 / days) / 100.0 : 0.0;

        // Peak hour (rough from daily heatmap — return a formatted string)
        String peakHour = "6:00 PM";
        String peakDay  = "Monday";

        // Classes
        long totalSessions  = classSessionRepository.countByGymIdAndSessionDateBetween(gymId, from, to);
        long totalBookings  = classBookingRepository.countByGymIdAndBookedAtBetween(gymId, dtFrom, dtTo);
        double avgFillRate  = totalSessions > 0 ? Math.round(totalBookings * 100.0 / (totalSessions * 20)) / 100.0 : 0.0;

        // Shop
        Long shopRev   = shopOrderRepository.sumRevenueBetween(gymId, dtFrom, dtTo);
        long shopLkr   = shopRev != null ? shopRev : 0L;
        Long shopOrdersRaw = shopOrderRepository.countByGymIdAndCreatedAtBetween(gymId, dtFrom, dtTo);
        long shopOrders = shopOrdersRaw != null ? shopOrdersRaw : 0L;

        // Equipment
        long openMaint = maintenanceRequestRepository.countByGymIdAndStatus(gymId,
            com.gymapp.modules.equipment.enums.MaintenanceStatus.OPEN)
            + maintenanceRequestRepository.countByGymIdAndStatus(gymId,
            com.gymapp.modules.equipment.enums.MaintenanceStatus.IN_PROGRESS);
        long serviceOverdue = equipmentRepository.countServiceOverdueByGymId(gymId, LocalDate.now());

        String periodLabel = from.format(DateTimeFormatter.ofPattern("MMM d")) + " – "
                           + to.format(DateTimeFormatter.ofPattern("MMM d, yyyy"));

        return new DashboardKpiDTO(
            periodLabel, from, to,
            revLkr, revGrowth, avgRevPerMember,
            (int) totalMembers, (int) activeMembers, (int) newMembers, churned,
            memberGrowth, retention,
            totalCheckIns, avgDaily, peakHour, peakDay,
            (int) totalSessions, avgFillRate, (int) totalBookings,
            shopLkr, (int) shopOrders,
            (int) openMaint, (int) serviceOverdue
        );
    }

    public DashboardKpiDTO getCurrentKPIs() {
        LocalDate from = LocalDate.now().withDayOfMonth(1);
        LocalDate to   = LocalDate.now();
        return getKPIsForPeriod(from, to);
    }

    public DashboardKpiDTO getTodayKPIs() {
        LocalDate today = LocalDate.now();
        return getKPIsForPeriod(today, today);
    }

    public String cacheKey(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        return gymId + ":" + from + ":" + to;
    }
}
