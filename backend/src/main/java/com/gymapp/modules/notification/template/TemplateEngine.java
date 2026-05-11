package com.gymapp.modules.notification.template;

import com.gymapp.modules.notification.NotificationTemplate;
import com.gymapp.modules.notification.NotificationTemplateRepository;
import com.gymapp.modules.notification.enums.NotificationChannel;
import com.gymapp.modules.notification.enums.NotificationLanguage;
import com.gymapp.modules.notification.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class TemplateEngine {

    private final NotificationTemplateRepository templateRepository;

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\{\\{(\\w+)}}");

    public String render(UUID gymId, NotificationType type, NotificationChannel channel,
                         NotificationLanguage language, Map<String, Object> variables) {
        String template = resolveTemplate(gymId, type, channel, language);
        if (template == null) {
            template = getFallbackTemplate(type, channel, language);
        }
        return substitute(template, variables);
    }

    public String renderSubject(UUID gymId, NotificationType type, NotificationChannel channel,
                                NotificationLanguage language, Map<String, Object> variables) {
        List<NotificationTemplate> templates = templateRepository
            .findByTypeAndChannelAndLanguage(gymId, type, channel, language);

        if (!templates.isEmpty() && templates.get(0).getSubject() != null) {
            return substitute(templates.get(0).getSubject(), variables);
        }
        return getFallbackSubject(type);
    }

    public String preview(String bodyTemplate, Map<String, Object> variables) {
        return substitute(bodyTemplate, variables);
    }

    private String resolveTemplate(UUID gymId, NotificationType type,
                                   NotificationChannel channel, NotificationLanguage language) {
        List<NotificationTemplate> found = templateRepository
            .findByTypeAndChannelAndLanguage(gymId, type, channel, language);

        if (found.isEmpty() && language != NotificationLanguage.EN) {
            found = templateRepository.findByTypeAndChannelAndLanguage(
                gymId, type, channel, NotificationLanguage.EN);
        }

        return found.isEmpty() ? null : found.get(0).getBodyTemplate();
    }

    private String substitute(String template, Map<String, Object> variables) {
        if (template == null || variables == null) return template;
        StringBuffer result = new StringBuffer();
        Matcher m = VARIABLE_PATTERN.matcher(template);
        while (m.find()) {
            String key = m.group(1);
            Object val = variables.getOrDefault(key, "{{" + key + "}}");
            m.appendReplacement(result, Matcher.quoteReplacement(val != null ? val.toString() : ""));
        }
        m.appendTail(result);
        return result.toString();
    }

    private String getFallbackTemplate(NotificationType type, NotificationChannel channel,
                                       NotificationLanguage language) {
        return switch (type) {
            case MEMBERSHIP_EXPIRY  -> "Dear {{memberName}}, your membership expires on {{expiryDate}}.";
            case PAYMENT_DUE        -> "Dear {{memberName}}, payment of Rs. {{amount}} is due on {{dueDate}}.";
            case PAYMENT_RECEIVED   -> "Dear {{memberName}}, payment of Rs. {{amount}} received. Thank you!";
            case PAYMENT_FAILED     -> "Dear {{memberName}}, your payment of Rs. {{amount}} failed. Please retry.";
            case CLASS_BOOKING      -> "Booking confirmed for {{className}} on {{classDate}} at {{classTime}}.";
            case CLASS_CANCELLED    -> "{{className}} on {{classDate}} has been cancelled.";
            case CLASS_REMINDER     -> "Reminder: {{className}} starts at {{classTime}} today.";
            case WORKOUT_ASSIGNED   -> "New workout plan '{{planName}}' assigned by {{trainerName}}.";
            case NUTRITION_ASSIGNED -> "New nutrition plan '{{planName}}' assigned to you.";
            case TRAINER_ASSIGNED   -> "Trainer {{trainerName}} has been assigned to you.";
            case PT_SESSION         -> "PT session with {{trainerName}} on {{sessionDate}} at {{sessionTime}}.";
            case MAINTENANCE_ALERT  -> "Equipment {{equipmentName}} requires maintenance: {{issue}}.";
            case SERVICE_DUE        -> "Equipment {{equipmentName}} service is due on {{dueDate}}.";
            case LOW_STOCK          -> "Low stock alert: {{productName}} has only {{stockCount}} units left.";
            case ANNOUNCEMENT       -> "{{message}}";
            case LEAD_FOLLOWUP      -> "Follow up with {{leadName}} regarding {{topic}}.";
            case GENERAL            -> "{{message}}";
        };
    }

    private String getFallbackSubject(NotificationType type) {
        return type.getLabel();
    }
}
