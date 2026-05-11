package com.gymapp.modules.classes;

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
public class ClassNotificationService {

    private final RabbitTemplate rabbitTemplate;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    public void sendBookingConfirmation(Member member, ClassSession session, FitnessClass fitnessClass) {
        String cancelDeadline = session.getStartTime().minusHours(1).format(TIME_FMT);
        String message = """
            ✅ Class booked successfully!
            📚 %s
            📅 Date: %s
            ⏰ Time: %s - %s
            📍 Room: %s
            
            Cancel before %s on the same day.""".formatted(
                fitnessClass.getName(),
                session.getSessionDate().format(DATE_FMT),
                session.getStartTime().format(TIME_FMT),
                session.getEndTime().format(TIME_FMT),
                fitnessClass.getRoom() != null ? fitnessClass.getRoom() : "TBA",
                cancelDeadline);
        publish(member, "Class Booking Confirmed 🎉", message);
    }

    public void sendCancellationByMember(Member member, ClassSession session, FitnessClass fitnessClass) {
        String message = """
            ❌ Booking cancelled.
            %s on %s
            We hope to see you next time! 💪""".formatted(
                fitnessClass.getName(),
                session.getSessionDate().format(DATE_FMT));
        publish(member, "Booking Cancelled", message);
    }

    public void sendSessionCancelledByGym(Member member, ClassSession session,
                                           FitnessClass fitnessClass, String reason) {
        String message = """
            ⚠️ Class Cancelled!
            %s on %s has been cancelled.
            Reason: %s
            Sorry for the inconvenience.
            Book another class from the app.""".formatted(
                fitnessClass.getName(),
                session.getSessionDate().format(DATE_FMT),
                reason != null ? reason : "No reason provided");
        publish(member, "Class Cancelled ⚠️", message);
    }

    public void sendWaitlistPromotion(Member member, ClassSession session, FitnessClass fitnessClass) {
        String message = """
            🎉 Great news! A slot opened up!
            %s on %s at %s
            You have been moved from the waitlist.
            Your booking is confirmed! ✅""".formatted(
                fitnessClass.getName(),
                session.getSessionDate().format(DATE_FMT),
                session.getStartTime().format(TIME_FMT));
        publish(member, "You're off the waitlist! 🎉", message);
    }

    public void sendWaitlistJoined(Member member, ClassSession session,
                                    FitnessClass fitnessClass, int position) {
        String message = """
            📋 You are #%d on the waitlist for:
            %s on %s at %s
            We'll notify you if a spot opens up!""".formatted(
                position,
                fitnessClass.getName(),
                session.getSessionDate().format(DATE_FMT),
                session.getStartTime().format(TIME_FMT));
        publish(member, "Added to Waitlist #" + position, message);
    }

    public void sendClassReminder(Member member, ClassSession session, FitnessClass fitnessClass) {
        String message = """
            🔔 Class Reminder!
            %s starts in 1 hour.
            ⏰ %s | 📍 %s
            Don't forget your gear! 💪""".formatted(
                fitnessClass.getName(),
                session.getStartTime().format(TIME_FMT),
                fitnessClass.getRoom() != null ? fitnessClass.getRoom() : "TBA");
        publish(member, "Class starts soon! 🔔", message);
    }

    private void publish(Member member, String title, String body) {
        try {
            Map<String, Object> payload = Map.of(
                "to",      member.getPhone() != null ? member.getPhone() : member.getEmail(),
                "name",    member.getFirstName(),
                "subject", title,
                "body",    body,
                "gymId",   member.getGymId().toString(),
                "channel", "WHATSAPP"
            );
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.PUSH_ROUTING_KEY,
                payload);
        } catch (Exception e) {
            log.warn("Failed to queue class notification for member {}: {}", member.getId(), e.getMessage());
        }
    }
}
