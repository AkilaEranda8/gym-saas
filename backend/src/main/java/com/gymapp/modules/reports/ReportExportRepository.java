package com.gymapp.modules.reports;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportExportRepository extends JpaRepository<ReportExport, UUID> {

    Page<ReportExport> findAllByGymIdOrderByGeneratedAtDesc(UUID gymId, Pageable pageable);

    Optional<ReportExport> findByIdAndGymId(UUID id, UUID gymId);

    void deleteByExpiresAtBefore(LocalDateTime now);
}
