package com.gymapp.modules.reports;

import com.gymapp.modules.reports.dto.ReportDtos.*;
import com.gymapp.modules.reports.enums.ReportFrequency;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledReportService {

    private final ScheduledReportRepository scheduledReportRepository;

    @Transactional(readOnly = true)
    public List<ScheduledReportDTO> listActive() {
        UUID gymId = TenantContext.getGymId();
        return scheduledReportRepository.findAllByGymIdAndIsActiveTrue(gymId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ScheduledReportDTO create(CreateScheduledReportRequest req) {
        UUID gymId = TenantContext.getGymId();
        ScheduledReport sr = new ScheduledReport();
        sr.setGymId(gymId);
        sr.setName(req.name());
        sr.setReportType(req.reportType());
        sr.setFrequency(req.frequency());
        sr.setRecipients(req.recipients() != null ? req.recipients() : List.of());
        sr.setWhatsappNumbers(req.whatsappNumbers() != null ? req.whatsappNumbers() : List.of());
        sr.setNextSendAt(computeNextSend(req.frequency()));
        sr.setIsActive(true);
        return toDTO(scheduledReportRepository.save(sr));
    }

    @Transactional
    public ScheduledReportDTO toggleActive(UUID id) {
        UUID gymId = TenantContext.getGymId();
        ScheduledReport sr = scheduledReportRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Scheduled report not found"));
        sr.setIsActive(!Boolean.TRUE.equals(sr.getIsActive()));
        return toDTO(scheduledReportRepository.save(sr));
    }

    @Transactional
    public void delete(UUID id) {
        UUID gymId = TenantContext.getGymId();
        ScheduledReport sr = scheduledReportRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Scheduled report not found"));
        scheduledReportRepository.delete(sr);
    }

    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void processDue() {
        List<ScheduledReport> due = scheduledReportRepository.findAllByNextSendAtBeforeAndIsActiveTrue(LocalDateTime.now());
        for (ScheduledReport sr : due) {
            try {
                log.info("Processing scheduled report {} for gym {}", sr.getName(), sr.getGymId());
                sr.setLastSentAt(LocalDateTime.now());
                sr.setNextSendAt(computeNextSend(sr.getFrequency()));
                scheduledReportRepository.save(sr);
            } catch (Exception e) {
                log.error("Failed to process scheduled report {}: {}", sr.getId(), e.getMessage());
            }
        }
    }

    private LocalDateTime computeNextSend(ReportFrequency freq) {
        LocalDate now = LocalDate.now();
        return switch (freq) {
            case DAILY   -> now.plusDays(1).atTime(7, 0);
            case WEEKLY  -> now.plusWeeks(1).with(java.time.DayOfWeek.MONDAY).atTime(7, 0);
            case MONTHLY -> now.plusMonths(1).withDayOfMonth(1).atTime(7, 0);
        };
    }

    private ScheduledReportDTO toDTO(ScheduledReport sr) {
        return new ScheduledReportDTO(
            sr.getId(), sr.getGymId(), sr.getName(),
            sr.getReportType(), sr.getFrequency(),
            sr.getRecipients(), sr.getWhatsappNumbers(),
            sr.getLastSentAt(), sr.getNextSendAt(),
            Boolean.TRUE.equals(sr.getIsActive())
        );
    }
}
