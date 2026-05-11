package com.gymapp.modules.notification;

import com.gymapp.modules.notification.enums.NotificationChannel;
import com.gymapp.modules.notification.enums.NotificationLanguage;
import com.gymapp.modules.notification.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    @Query("SELECT t FROM NotificationTemplate t " +
           "WHERE (t.gymId = :gymId OR t.gymId IS NULL) " +
           "AND t.type = :type AND t.channel = :channel AND t.language = :language " +
           "AND t.isActive = true " +
           "ORDER BY t.gymId NULLS LAST")
    List<NotificationTemplate> findByTypeAndChannelAndLanguage(
        @Param("gymId") UUID gymId,
        @Param("type") NotificationType type,
        @Param("channel") NotificationChannel channel,
        @Param("language") NotificationLanguage language);

    List<NotificationTemplate> findAllByGymId(UUID gymId);

    List<NotificationTemplate> findAllByGymIdIsNullAndIsActiveTrue();

    Optional<NotificationTemplate> findByGymIdAndTypeAndChannelAndLanguage(
        UUID gymId, NotificationType type, NotificationChannel channel, NotificationLanguage language);

    void deleteByGymIdAndTypeAndChannelAndLanguage(
        UUID gymId, NotificationType type, NotificationChannel channel, NotificationLanguage language);

    boolean existsByGymIdAndTypeAndChannelAndLanguage(
        UUID gymId, NotificationType type, NotificationChannel channel, NotificationLanguage language);
}
