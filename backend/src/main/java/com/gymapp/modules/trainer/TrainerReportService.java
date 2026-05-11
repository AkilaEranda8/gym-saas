package com.gymapp.modules.trainer;

import com.gymapp.modules.trainer.dto.TrainerMonthlyStatsDTO;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainerReportService {

    private final TrainerRepository          trainerRepository;
    private final TrainerSessionRepository   sessionRepository;
    private final TrainerAssignmentRepository assignmentRepository;
    private final TrainerReviewRepository    reviewRepository;

    public List<TrainerMonthlyStatsDTO> getMonthlyReport(YearMonth month) {
        UUID gymId  = TenantContext.getGymId();
        LocalDate from = month.atDay(1);
        LocalDate to   = month.atEndOfMonth();

        return trainerRepository.findAllByGymIdAndStatus(gymId, TrainerStatus.ACTIVE)
                .stream()
                .map(t -> {
                    long completed = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.COMPLETED);
                    long cancelled = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.CANCELLED);
                    long noShow    = sessionRepository.countByTrainerIdAndStatus(t.getId(), PTSessionStatus.NO_SHOW);
                    long clients   = assignmentRepository.countByTrainerIdAndStatus(t.getId(), AssignmentStatus.ACTIVE);
                    long newMonth  = sessionRepository.countByTrainerIdAndSessionDateBetween(t.getId(), from, to);
                    Double avgRat  = reviewRepository.getAverageRatingByTrainerId(t.getId());
                    return new TrainerMonthlyStatsDTO(t.getId(), t.getName(), month,
                        completed, cancelled, noShow, clients, newMonth,
                        avgRat != null ? avgRat : 0.0, 0L);
                })
                .toList();
    }

    public String exportToCsv(YearMonth month) {
        List<TrainerMonthlyStatsDTO> report = getMonthlyReport(month);
        StringWriter sw = new StringWriter();
        PrintWriter  pw = new PrintWriter(sw);
        pw.println("Trainer Name,Month,Completed Sessions,Cancelled,No Show,Active Clients,New This Month,Avg Rating");
        report.forEach(r -> pw.printf("%s,%s,%d,%d,%d,%d,%d,%.2f%n",
            escCsv(r.trainerName()), r.month().toString(),
            r.completedSessions(), r.cancelledSessions(), r.noShowSessions(),
            r.activeClients(), r.newClientsThisMonth(), r.averageRating()));
        return sw.toString();
    }

    private String escCsv(String val) {
        if (val == null) return "";
        return val.contains(",") ? "\"" + val.replace("\"", "\"\"") + "\"" : val;
    }
}
