package com.gymapp.modules.reports;

import com.gymapp.modules.reports.dto.ReportDtos.DashboardKpiDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final DashboardReportService dashboardService;

    public DashboardKpiDTO getDashboardSummary() {
        return dashboardService.getCurrentKPIs();
    }

    public DashboardKpiDTO getKPIsForPeriod(LocalDate from, LocalDate to) {
        return dashboardService.getKPIsForPeriod(from, to);
    }
}
