package com.gymapp.modules.reports;

import com.gymapp.modules.billing.PaymentRepository;
import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RevenueReportService {

    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public RevenueReportDTO generate(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        LocalDateTime dtFrom = from.atStartOfDay();
        LocalDateTime dtTo   = to.atTime(23, 59, 59);

        Long paid    = paymentRepository.sumRevenueBetween(gymId, dtFrom, dtTo);
        long paidLkr = paid != null ? paid : 0L;

        long paidCount    = paymentRepository.countByGymIdAndStatus(gymId, com.gymapp.shared.enums.PaymentStatus.PAID);
        long pendingCount = paymentRepository.countByGymIdAndStatus(gymId, com.gymapp.shared.enums.PaymentStatus.PENDING);
        long refundCount  = paymentRepository.countByGymIdAndStatus(gymId, com.gymapp.shared.enums.PaymentStatus.REFUNDED);
        long failCount    = paymentRepository.countByGymIdAndStatus(gymId, com.gymapp.shared.enums.PaymentStatus.FAILED);
        long total = paidCount + pendingCount + refundCount + failCount;
        long avg   = total > 0 ? paidLkr / total : 0L;

        // By type
        List<Object[]> byTypeRaw = paymentRepository.getRevenueByType(gymId, dtFrom, dtTo);
        List<RevenueByTypeDTO> byType = new ArrayList<>();
        for (Object[] row : byTypeRaw) {
            String type = row[0].toString();
            long rev  = ((Number) row[1]).longValue();
            long cnt  = ((Number) row[2]).longValue();
            double pct = paidLkr > 0 ? Math.round(rev * 10000.0 / paidLkr) / 100.0 : 0.0;
            byType.add(new RevenueByTypeDTO(type, formatLabel(type), rev, cnt, pct));
        }

        // Monthly trend
        List<MonthlyRevenueDTO> monthly = getMonthlyTrend(12);

        return new RevenueReportDTO(
            from, to, paidLkr, paidLkr, 0L, 0L, 0L,
            total, avg, byType,
            List.of(), monthly, List.of(), List.of()
        );
    }

    @Transactional(readOnly = true)
    public List<MonthlyRevenueDTO> getMonthlyTrend(int months) {
        UUID gymId = TenantContext.getGymId();
        List<MonthlyRevenueDTO> result = new ArrayList<>();
        long prevRev = 0L;
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDateTime mFrom = ym.atDay(1).atStartOfDay();
            LocalDateTime mTo   = ym.atEndOfMonth().atTime(23, 59, 59);
            Long rev = paymentRepository.sumRevenueBetween(gymId, mFrom, mTo);
            long revLkr = rev != null ? rev : 0L;
            double growth = prevRev > 0 ? Math.round((revLkr - prevRev) * 10000.0 / prevRev) / 100.0 : 0.0;
            result.add(new MonthlyRevenueDTO(
                ym.getMonthValue(), ym.getYear(),
                ym.format(DateTimeFormatter.ofPattern("MMM yyyy")),
                revLkr, 0L, revLkr, 0L, growth
            ));
            prevRev = revLkr;
        }
        return result;
    }

    private String formatLabel(String type) {
        return type.replace("_", " ").toLowerCase()
            .substring(0, 1).toUpperCase()
            + type.replace("_", " ").toLowerCase().substring(1);
    }
}
