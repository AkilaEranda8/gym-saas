package com.gymapp.modules.notification;

import com.gymapp.modules.notification.enums.BulkJobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BulkNotificationJobRepository extends JpaRepository<BulkNotificationJob, UUID> {

    Page<BulkNotificationJob> findAllByGymIdOrderByCreatedAtDesc(UUID gymId, Pageable pageable);

    List<BulkNotificationJob> findAllByStatusAndScheduledAtBefore(
        BulkJobStatus status, LocalDateTime now);

    List<BulkNotificationJob> findAllByGymIdAndStatus(UUID gymId, BulkJobStatus status);

    Optional<BulkNotificationJob> findByIdAndGymId(UUID id, UUID gymId);

    long countByGymIdAndStatus(UUID gymId, BulkJobStatus status);
}
