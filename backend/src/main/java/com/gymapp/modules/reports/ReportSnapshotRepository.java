package com.gymapp.modules.reports;

import com.gymapp.modules.reports.enums.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportSnapshotRepository extends JpaRepository<ReportSnapshot, UUID> {

    Optional<ReportSnapshot> findByGymIdAndReportTypeAndSnapshotDate(
            UUID gymId, ReportType reportType, LocalDate snapshotDate);

    List<ReportSnapshot> findAllByGymIdAndReportTypeAndSnapshotDateBetween(
            UUID gymId, ReportType reportType, LocalDate from, LocalDate to);

    List<ReportSnapshot> findAllByGymIdOrderBySnapshotDateDesc(UUID gymId);
}
