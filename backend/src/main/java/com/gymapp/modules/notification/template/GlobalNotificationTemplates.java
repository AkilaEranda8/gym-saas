package com.gymapp.modules.notification.template;

import com.gymapp.modules.notification.NotificationTemplate;
import com.gymapp.modules.notification.NotificationTemplateRepository;
import com.gymapp.modules.notification.enums.NotificationChannel;
import com.gymapp.modules.notification.enums.NotificationLanguage;
import com.gymapp.modules.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class GlobalNotificationTemplates implements ApplicationRunner {

    private final NotificationTemplateRepository templateRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedIfMissing();
    }

    private void seedIfMissing() {
        List<NotificationTemplate> existing = templateRepository.findAllByGymIdIsNullAndIsActiveTrue();
        if (!existing.isEmpty()) {
            log.debug("Global notification templates already seeded ({} found)", existing.size());
            return;
        }
        log.info("Seeding global notification templates...");
        seedEnglishTemplates();
        log.info("Global notification templates seeded.");
    }

    private void seedEnglishTemplates() {
        seed(NotificationType.MEMBERSHIP_EXPIRY, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Membership Expiring Soon",
            "Hi {{memberName}}, your membership expires on {{expiryDate}}. Renew now to keep your streak going!");

        seed(NotificationType.MEMBERSHIP_EXPIRY, NotificationChannel.EMAIL, NotificationLanguage.EN,
            "Your Membership is Expiring",
            "Dear {{memberName}},\n\nYour membership at {{gymName}} expires on {{expiryDate}}.\n\nRenew now to continue enjoying full access to all facilities.\n\nThank you for being a valued member!");

        seed(NotificationType.MEMBERSHIP_EXPIRY, NotificationChannel.WHATSAPP, NotificationLanguage.EN,
            null,
            "Hi {{memberName}} 👋 Your membership at *{{gymName}}* expires on *{{expiryDate}}*. Reply to renew or visit us today!");

        seed(NotificationType.PAYMENT_DUE, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Payment Due",
            "Hi {{memberName}}, payment of Rs. {{amount}} is due on {{dueDate}}. Pay now to avoid interruption.");

        seed(NotificationType.PAYMENT_DUE, NotificationChannel.EMAIL, NotificationLanguage.EN,
            "Payment Reminder",
            "Dear {{memberName}},\n\nA payment of Rs. {{amount}} is due on {{dueDate}}.\n\nPlease make your payment at the earliest to avoid any service interruption.\n\nThank you!");

        seed(NotificationType.PAYMENT_DUE, NotificationChannel.WHATSAPP, NotificationLanguage.EN,
            null,
            "Hi {{memberName}} 💳 Payment of *Rs. {{amount}}* is due on *{{dueDate}}*. Visit us or pay online to continue your membership.");

        seed(NotificationType.PAYMENT_RECEIVED, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Payment Confirmed ✅",
            "Payment of Rs. {{amount}} received! Your membership is active until {{expiryDate}}.");

        seed(NotificationType.PAYMENT_RECEIVED, NotificationChannel.EMAIL, NotificationLanguage.EN,
            "Payment Receipt",
            "Dear {{memberName}},\n\nWe have received your payment of Rs. {{amount}} (Ref: {{paymentNumber}}).\n\nYour membership is active until {{expiryDate}}.\n\nThank you for choosing {{gymName}}!");

        seed(NotificationType.CLASS_BOOKING, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Class Booking Confirmed",
            "Your spot in {{className}} on {{classDate}} at {{classTime}} is confirmed!");

        seed(NotificationType.CLASS_REMINDER, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Class Starting Soon",
            "Don't forget! {{className}} starts in 30 minutes at {{classTime}}.");

        seed(NotificationType.CLASS_CANCELLED, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Class Cancelled",
            "Sorry, {{className}} on {{classDate}} has been cancelled. We apologize for the inconvenience.");

        seed(NotificationType.TRAINER_ASSIGNED, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Trainer Assigned",
            "Great news! {{trainerName}} has been assigned as your personal trainer.");

        seed(NotificationType.PT_SESSION, NotificationChannel.PUSH, NotificationLanguage.EN,
            "PT Session Reminder",
            "Your session with {{trainerName}} is tomorrow at {{sessionTime}}. Get ready!");

        seed(NotificationType.WORKOUT_ASSIGNED, NotificationChannel.PUSH, NotificationLanguage.EN,
            "New Workout Plan",
            "{{trainerName}} has assigned a new workout plan '{{planName}}' to you. Check it out!");

        seed(NotificationType.NUTRITION_ASSIGNED, NotificationChannel.PUSH, NotificationLanguage.EN,
            "New Nutrition Plan",
            "A new nutrition plan '{{planName}}' has been assigned to you. Start your journey!");

        seed(NotificationType.MAINTENANCE_ALERT, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Maintenance Required",
            "{{equipmentName}} needs maintenance: {{issue}}. Please schedule immediately.");

        seed(NotificationType.SERVICE_DUE, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Service Due",
            "{{equipmentName}} service is due on {{dueDate}}. Schedule maintenance now.");

        seed(NotificationType.LOW_STOCK, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Low Stock Alert",
            "⚠️ {{productName}} is running low — only {{stockCount}} units remaining.");

        seed(NotificationType.ANNOUNCEMENT, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Announcement",
            "{{message}}");

        seed(NotificationType.ANNOUNCEMENT, NotificationChannel.EMAIL, NotificationLanguage.EN,
            "Important Announcement from {{gymName}}",
            "Dear {{memberName}},\n\n{{message}}\n\nBest regards,\n{{gymName}} Team");

        seed(NotificationType.GENERAL, NotificationChannel.PUSH, NotificationLanguage.EN,
            "Notification",
            "{{message}}");
    }

    private void seed(NotificationType type, NotificationChannel channel,
                      NotificationLanguage language, String subject, String body) {
        if (!templateRepository.existsByGymIdAndTypeAndChannelAndLanguage(
            null, type, channel, language)) {
            NotificationTemplate t = new NotificationTemplate();
            t.setGymId(null);
            t.setType(type);
            t.setChannel(channel);
            t.setLanguage(language);
            t.setSubject(subject);
            t.setBodyTemplate(body);
            t.setIsActive(true);
            t.setIsCustom(false);
            templateRepository.save(t);
        }
    }
}
