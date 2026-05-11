package com.gymapp.modules.trainer;

import com.gymapp.config.RabbitMQConfig;
import com.gymapp.modules.member.Member;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrainerNotificationService {

    private final RabbitTemplate rabbitTemplate;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    public void sendWelcomeMessage(Trainer trainer) {
        String specialties = trainer.getSpecialtyList() == null || trainer.getSpecialtyList().isEmpty()
                ? "N/A"
                : trainer.getSpecialtyList().stream()
                    .map(s -> s.getSpecialty().name())
                    .reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);
        String message = """
            🏋️ Welcome to PowerHouse Team, %s!
            Your trainer account has been created.
            
            📧 Login: %s
            🔑 Specialties: %s
            
            Download the trainer app and start managing your sessions.""".formatted(
                trainer.getName(), trainer.getEmail(), specialties);
        publishToTrainer(trainer, "Welcome to the Team! 🎉", message);
    }

    public void sendAssignmentNotification(Trainer trainer, Member member, AssignmentType type) {
        String message = """
            👤 New Client Assigned!
            Member: %s
            Type: %s
            
            View member profile in the trainer app.""".formatted(
                member.getFirstName() + " " + member.getLastName(),
                type.name());
        publishToTrainer(trainer, "New Client Assigned 👤", message);
    }

    public void sendSessionReminder(Trainer trainer, Member member, TrainerSession session) {
        String message = """
            ⏰ PT Session Tomorrow!
            Client: %s
            Date: %s at %s
            Duration: %d mins""".formatted(
                member.getFirstName() + " " + member.getLastName(),
                session.getSessionDate().format(DATE_FMT),
                session.getStartTime().format(TIME_FMT),
                java.time.temporal.ChronoUnit.MINUTES.between(session.getStartTime(), session.getEndTime()));
        publishToTrainer(trainer, "Session Reminder ⏰", message);
    }

    public void sendLeaveApproval(Trainer trainer, TrainerLeave leave, boolean approved) {
        String status = approved ? "APPROVED ✅" : "REJECTED ❌";
        String message = """
            %s — Leave Request %s
            %s to %s
            %s""".formatted(
                status,
                approved ? "Approved" : "Rejected",
                leave.getFromDate().format(DATE_FMT),
                leave.getToDate().format(DATE_FMT),
                leave.getReason() != null ? "Reason: " + leave.getReason() : "");
        publishToTrainer(trainer, "Leave Request " + (approved ? "Approved ✅" : "Rejected ❌"), message);
    }

    public void sendFeedbackRequest(Member member, Trainer trainer) {
        String message = """
            💬 How was your session with %s?
            We'd love to hear your feedback!
            Please rate your trainer in the app.""".formatted(trainer.getName());
        publishToMember(member, "Rate Your PT Session 💬", message);
    }

    public void sendCertExpiryAlert(Trainer trainer, TrainerCertification cert, String urgency) {
        String message = """
            %s Certification Expiry Notice
            %s
            Expires: %s
            Please renew as soon as possible.""".formatted(
                urgency,
                cert.getName(),
                cert.getExpiryDate() != null ? cert.getExpiryDate().format(DATE_FMT) : "Unknown");
        publishToTrainer(trainer, urgency + " Certification Alert", message);
    }

    private void publishToTrainer(Trainer trainer, String title, String body) {
        publishNotification(
                trainer.getPhone() != null ? trainer.getPhone() : trainer.getEmail(),
                trainer.getName(), title, body,
                trainer.getGymId() != null ? trainer.getGymId().toString() : "");
    }

    private void publishToMember(Member member, String title, String body) {
        publishNotification(
                member.getPhone() != null ? member.getPhone() : member.getEmail(),
                member.getFirstName(), title, body,
                member.getGymId() != null ? member.getGymId().toString() : "");
    }

    private void publishNotification(String to, String name, String title, String body, String gymId) {
        try {
            Map<String, Object> payload = Map.of(
                "to",      to != null ? to : "",
                "name",    name != null ? name : "",
                "subject", title,
                "body",    body,
                "gymId",   gymId,
                "channel", "WHATSAPP"
            );
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.PUSH_ROUTING_KEY,
                payload);
        } catch (Exception e) {
            log.warn("Failed to queue trainer notification: {}", e.getMessage());
        }
    }
}
