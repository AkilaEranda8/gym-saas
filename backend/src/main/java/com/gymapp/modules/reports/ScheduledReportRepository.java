package com.gymapp.modules.reports;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduledReportRepository extends JpaRepository<ScheduledReport, UUID> {

    List<ScheduledReport> findAllByGymIdAndIsActiveTrue(UUID gymId);

    List<ScheduledReport> findAllByNextSendAtBeforeAndIsActiveTrue(LocalDateTime now);

    Optional<ScheduledReport> findByIdAndGymId(UUID id, UUID gymId);
}
