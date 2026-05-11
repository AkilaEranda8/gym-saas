package com.gymapp.modules.equipment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, UUID> {

    List<MaintenanceLog> findAllByRequestIdOrderByCreatedAtDesc(UUID requestId);
}
