package com.gymapp.modules.reports;

import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.modules.reports.enums.ReportFormat;
import com.gymapp.modules.reports.enums.ReportType;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final ReportExportRepository exportRepository;
    private final RevenueReportService   revenueService;
    private final MemberReportService    memberService;
    private final AttendanceReportService attendanceService;

    @Transactional(readOnly = true)
    public List<ReportExportDTO> listExports(int page, int size) {
        UUID gymId = TenantContext.getGymId();
        return exportRepository.findAllByGymIdOrderByGeneratedAtDesc(gymId, PageRequest.of(page, size))
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public String exportCsv(ReportType type, LocalDate from, LocalDate to, String generatedBy) {
        UUID gymId = TenantContext.getGymId();
        String csv  = generateCsv(type, from, to);
        byte[] bytes = csv.getBytes();

        ReportExport export = new ReportExport();
        export.setGymId(gymId);
        export.setReportType(type);
        export.setFormat(ReportFormat.CSV);
        export.setFromDate(from);
        export.setToDate(to);
        export.setGeneratedBy(generatedBy);
        export.setGeneratedAt(LocalDateTime.now());
        export.setExpiresAt(LocalDateTime.now().plusDays(7));
        export.setFileSizeBytes((long) bytes.length);
        exportRepository.save(export);

        return csv;
    }

    @Transactional
    public void deleteExpired() {
        exportRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    private String generateCsv(ReportType type, LocalDate from, LocalDate to) {
        return switch (type) {
            case REVENUE_SUMMARY  -> buildRevenueCsv(from, to);
            case MEMBER_GROWTH    -> buildMemberCsv(from, to);
            case ATTENDANCE_SUMMARY -> buildAttendanceCsv(from, to);
            default               -> "type,from,to\n" + type + "," + from + "," + to + "\n";
        };
    }

    private String buildRevenueCsv(LocalDate from, LocalDate to) {
        RevenueReportDTO r = revenueService.generate(from, to);
        StringWriter sw = new StringWriter();
        PrintWriter  pw = new PrintWriter(sw);
        pw.println("Month,Revenue (LKR),Transactions,Growth %");
        r.revenueByMonth().forEach(m ->
            pw.printf("%s,%d,%d,%.2f%n", m.label(), m.revenueLkr(), m.transactionCount(), m.growthPct()));
        return sw.toString();
    }

    private String buildMemberCsv(LocalDate from, LocalDate to) {
        MemberReportDTO r = memberService.generate(from, to);
        StringWriter sw = new StringWriter();
        PrintWriter  pw = new PrintWriter(sw);
        pw.println("Month,New Members,Churned,Net Growth,Total");
        r.growthByMonth().forEach(m ->
            pw.printf("%s,%d,%d,%d,%d%n", m.label(), m.newMembers(), m.churnedMembers(), m.netGrowth(), m.totalMembers()));
        return sw.toString();
    }

    private String buildAttendanceCsv(LocalDate from, LocalDate to) {
        AttendanceReportDTO r = attendanceService.generate(from, to, null);
        StringWriter sw = new StringWriter();
        PrintWriter  pw = new PrintWriter(sw);
        pw.println("Date,Day,Check-ins,Weekend,Holiday");
        r.dailyAttendance().forEach(d ->
            pw.printf("%s,%s,%d,%s,%s%n", d.date(), d.dayOfWeek(), d.count(), d.isWeekend(), d.isSriLankanHoliday()));
        return sw.toString();
    }

    private ReportExportDTO toDTO(ReportExport e) {
        return new ReportExportDTO(
            e.getId(), e.getReportType(), e.getFormat(),
            e.getFileUrl(), e.getFileSizeBytes(),
            e.getFromDate(), e.getToDate(),
            e.getGeneratedBy(), e.getGeneratedAt(),
            e.getExpiresAt(), e.getDownloadCount() != null ? e.getDownloadCount() : 0
        );
    }
}
