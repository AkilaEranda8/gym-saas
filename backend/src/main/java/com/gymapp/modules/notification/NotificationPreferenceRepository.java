package com.gymapp.modules.notification;

import com.gymapp.modules.notification.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {

    Optional<NotificationPreference> findByUserIdAndNotificationType(
        String userId, NotificationType notificationType);

    List<NotificationPreference> findAllByUserId(String userId);

    List<NotificationPreference> findAllByGymIdAndUserId(UUID gymId, String userId);
}
