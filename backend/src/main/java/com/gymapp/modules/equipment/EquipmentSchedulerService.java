package com.gymapp.modules.equipment;

import com.gymapp.modules.notification.NotificationService;
import com.gymapp.modules.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquipmentSchedulerService {

    private final EquipmentRepository      equipmentRepository;
    private final ServiceScheduleRepository scheduleRepository;
    private final NotificationService      notificationService;

    @Scheduled(cron = "0 0 8 * * *")
    public void checkServiceOverdue() {
        log.info("[Scheduler] Service overdue check triggered at {}", java.time.LocalDateTime.now());
    }

    @Scheduled(cron = "0 0 9 * * MON")
    public void checkServiceDueSoon() {
        log.info("[Scheduler] Weekly service due-soon check triggered at {}", java.time.LocalDateTime.now());
    }

    @Scheduled(cron = "0 30 8 * * *")
    public void checkWarrantyExpiry() {
        log.info("[Scheduler] Warranty expiry check triggered at {}", java.time.LocalDateTime.now());
    }

    public void notifyServiceOverdueForGym(UUID gymId) {
        List<Equipment> overdue = equipmentRepository.findServiceOverdue(gymId, LocalDate.now());
        if (!overdue.isEmpty()) {
            try {
                notificationService.broadcastToGym(gymId,
                    "⚠️ Service Overdue: " + overdue.size() + " Equipment Item(s)",
                    overdue.size() + " equipment item(s) are overdue for service. Please schedule maintenance.",
                    NotificationType.MAINTENANCE_ALERT);
            } catch (Exception ex) { log.warn("Notify failed: {}", ex.getMessage()); }
        }
    }
}
