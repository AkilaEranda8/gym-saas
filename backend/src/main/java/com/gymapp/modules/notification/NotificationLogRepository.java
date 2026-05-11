package com.gymapp.modules.notification;

import com.gymapp.modules.notification.enums.NotificationChannel;
import com.gymapp.modules.notification.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {

    List<NotificationLog> findAllByNotificationId(UUID notificationId);

    Page<NotificationLog> findAllByGymIdAndChannelAndStatus(
        UUID gymId, NotificationChannel channel, NotificationStatus status, Pageable pageable);

    Page<NotificationLog> findAllByGymIdOrderByCreatedAtDesc(UUID gymId, Pageable pageable);

    Page<NotificationLog> findAllByGymIdAndChannelOrderByCreatedAtDesc(
        UUID gymId, NotificationChannel channel, Pageable pageable);

    Page<NotificationLog> findAllByGymIdAndStatusOrderByCreatedAtDesc(
        UUID gymId, NotificationStatus status, Pageable pageable);

    long countByGymIdAndStatusAndCreatedAtBetween(
        UUID gymId, NotificationStatus status, LocalDateTime from, LocalDateTime to);

    long countByGymIdAndChannelAndCreatedAtBetween(
        UUID gymId, NotificationChannel channel, LocalDateTime from, LocalDateTime to);

    @Query("SELECT l FROM NotificationLog l WHERE l.gymId = :gymId " +
           "AND l.status = 'FAILED' AND l.createdAt BETWEEN :from AND :to " +
           "ORDER BY l.createdAt DESC")
    List<NotificationLog> findFailedLogs(
        @Param("gymId") UUID gymId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to);
}
