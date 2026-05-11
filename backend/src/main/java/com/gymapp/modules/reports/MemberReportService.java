package com.gymapp.modules.reports;

import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.MemberStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberReportService {

    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public MemberReportDTO generate(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();

        long total     = memberRepository.countByGymId(gymId);
        long active    = memberRepository.countByGymIdAndStatus(gymId, MemberStatus.ACTIVE);
        long expired   = memberRepository.countByGymIdAndStatus(gymId, MemberStatus.EXPIRED);
        long suspended = memberRepository.countByGymIdAndStatus(gymId, MemberStatus.SUSPENDED);
        long newMembers = memberRepository.countByGymIdAndJoinDateAfter(gymId, from);

        List<Member> expiringThisWeek = memberRepository.findExpiringMembers(gymId, LocalDate.now(), LocalDate.now().plusDays(7));

        double retention = calculateRetentionRate(from, to);
        double avgDuration = total > 0 ? estimateAvgDuration(gymId) : 0.0;

        List<MonthlyGrowthDTO> growth = getGrowthTrend(12);

        return new MemberReportDTO(
            from, to, total, active, newMembers, 0L,
            expiringThisWeek.size(), expired, suspended,
            retention, avgDuration,
            List.of(), List.of(), growth
        );
    }

    @Transactional(readOnly = true)
    public List<MonthlyGrowthDTO> getGrowthTrend(int months) {
        UUID gymId = TenantContext.getGymId();
        List<MonthlyGrowthDTO> result = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym   = YearMonth.now().minusMonths(i);
            LocalDate mStart = ym.atDay(1);
            long newInMonth = memberRepository.countByGymIdAndJoinDateAfter(gymId, mStart);
            long totalAtEnd = memberRepository.countByGymId(gymId);
            result.add(new MonthlyGrowthDTO(
                ym.getMonthValue(), ym.getYear(),
                ym.format(DateTimeFormatter.ofPattern("MMM yyyy")),
                newInMonth, 0L, newInMonth, totalAtEnd
            ));
        }
        return result;
    }

    public double calculateRetentionRate(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        long active = memberRepository.countByGymIdAndStatus(gymId, MemberStatus.ACTIVE);
        long total  = memberRepository.countByGymId(gymId);
        return total > 0 ? Math.round(active * 10000.0 / total) / 100.0 : 0.0;
    }

    private double estimateAvgDuration(UUID gymId) {
        return 180.0;
    }
}
