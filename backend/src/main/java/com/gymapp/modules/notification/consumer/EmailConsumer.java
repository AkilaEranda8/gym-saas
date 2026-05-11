package com.gymapp.modules.notification.consumer;

import com.gymapp.config.RabbitMQConfig;
import com.gymapp.modules.notification.NotificationLog;
import com.gymapp.modules.notification.NotificationLogRepository;
import com.gymapp.modules.notification.enums.NotificationStatus;
import com.gymapp.modules.notification.messaging.NotificationMessage;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailConsumer {

    private final NotificationLogRepository logRepository;
    private final JavaMailSender            mailSender;

    @Value("${spring.mail.from:noreply@gymapp.lk}")
    private String fromEmail;

    @Value("${app.name:PowerHouse Gym}")
    private String appName;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void process(NotificationMessage msg) {
        if (msg.getRecipient() == null || !msg.getRecipient().contains("@")) {
            log.debug("Skipping email for non-email recipient: {}", msg.getRecipient());
            return;
        }

        log.debug("Processing email to {}", msg.getRecipient());

        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(msg.getRecipient());
            helper.setSubject(msg.getSubject() != null ? msg.getSubject() : appName + " Notification");
            helper.setText(buildHtmlBody(msg), true);

            mailSender.send(mime);
            updateLogStatus(msg, NotificationStatus.SENT, null, null);
            log.info("Email sent to {}", msg.getRecipient());

        } catch (Exception e) {
            log.error("Email failed for {}: {}", msg.getRecipient(), e.getMessage());
            updateLogStatus(msg, NotificationStatus.FAILED, null, e.getMessage());
        }
    }

    private String buildHtmlBody(NotificationMessage msg) {
        String bodyContent = msg.getMessage() != null
            ? msg.getMessage().replace("\n", "<br/>")
            : "";

        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8"/>
              <style>
                body { font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #f59e0b; padding: 24px 32px; color: #fff; }
                .header h1 { margin: 0; font-size: 22px; }
                .body { padding: 32px; color: #333; font-size: 15px; line-height: 1.6; }
                .footer { padding: 16px 32px; background: #f8fafc; color: #888; font-size: 12px; border-top: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header"><h1>%s</h1></div>
                <div class="body">%s</div>
                <div class="footer">
                  This email was sent by %s. If you have questions, please contact your gym directly.
                </div>
              </div>
            </body>
            </html>
            """.formatted(appName, bodyContent, appName);
    }

    private void updateLogStatus(NotificationMessage msg, NotificationStatus status,
                                 String ref, String error) {
        try {
            if (msg.getNotificationId() == null) return;
            List<NotificationLog> logs = logRepository.findAllByNotificationId(
                UUID.fromString(msg.getNotificationId()));
            logs.stream()
                .filter(l -> msg.getRecipient() != null && msg.getRecipient().equals(l.getRecipient()))
                .findFirst()
                .ifPresent(l -> {
                    l.setStatus(status);
                    l.setProviderRef(ref);
                    l.setErrorMessage(error);
                    if (status == NotificationStatus.SENT) l.setSentAt(LocalDateTime.now());
                    logRepository.save(l);
                });
        } catch (Exception e) {
            log.warn("Failed to update email log: {}", e.getMessage());
        }
    }
}
