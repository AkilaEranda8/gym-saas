package com.gymapp.modules.notification;

import com.gymapp.modules.notification.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findAllByGymIdAndRecipientIdOrderByCreatedAtDesc(
        UUID gymId, String recipientId, Pageable pageable);

    Page<Notification> findAllByGymIdAndRecipientIdAndIsReadFalseOrderByCreatedAtDesc(
        UUID gymId, String recipientId, Pageable pageable);

    long countByGymIdAndRecipientIdAndIsReadFalse(UUID gymId, String recipientId);

    List<Notification> findAllByGymIdAndTypeAndCreatedAtBetween(
        UUID gymId, NotificationType type, LocalDateTime from, LocalDateTime to);

    Optional<Notification> findByIdAndGymId(UUID id, UUID gymId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :now " +
           "WHERE n.gymId = :gymId AND n.recipientId = :recipientId AND n.isRead = false")
    void markAllReadByGymIdAndRecipientId(
        @Param("gymId") UUID gymId,
        @Param("recipientId") String recipientId,
        @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.gymId = :gymId AND n.createdAt < :before")
    void deleteOldNotifications(@Param("gymId") UUID gymId, @Param("before") LocalDateTime before);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.gymId = :gymId AND n.createdAt BETWEEN :from AND :to AND n.isSent = true")
    long countSentBetween(@Param("gymId") UUID gymId,
        @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
