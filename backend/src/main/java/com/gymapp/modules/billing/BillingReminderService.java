package com.gymapp.modules.billing;

import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingReminderService {

    private final PaymentRepository paymentRepo;
    private final PaymentReminderRepository reminderRepo;
    private final MemberRepository memberRepo;
    private final RabbitTemplate rabbitTemplate;

    @Scheduled(cron = "0 0 9 * * *")
    public void sendOverdueReminders() {
        log.info("Running overdue payment reminder job");
        List<Payment> overdue = paymentRepo.findAllOverduePayments(LocalDate.now());

        for (Payment payment : overdue) {
            Optional<Member> memberOpt = memberRepo.findById(payment.getMemberId());
            if (memberOpt.isEmpty()) continue;
            Member member = memberOpt.get();

            PaymentReminder reminder = new PaymentReminder();
            reminder.setGymId(payment.getGymId());
            reminder.setMemberId(member.getId());
            reminder.setPaymentId(payment.getId());
            reminder.setReminderType(ReminderType.PAYMENT_OVERDUE);
            reminder.setChannel("WHATSAPP");
            reminder.setStatus("SENT");
            reminderRepo.save(reminder);

            try {
                Map<String, Object> msg = Map.of(
                        "type", "PAYMENT_REMINDER",
                        "memberId", member.getId().toString(),
                        "memberName", member.getFirstName() + " " + member.getLastName(),
                        "memberEmail", member.getEmail(),
                        "paymentNumber", payment.getPaymentNumber(),
                        "amountDue", payment.getFinalAmountLkr(),
                        "dueDate", payment.getDueDate().toString()
                );
                rabbitTemplate.convertAndSend("gym.notifications", "notification.billing.reminder", msg);
            } catch (Exception e) {
                log.warn("Failed to send reminder for payment {}: {}", payment.getId(), e.getMessage());
                reminder.setStatus("FAILED");
                reminderRepo.save(reminder);
            }
        }
        log.info("Overdue reminder job completed: {} reminders sent", overdue.size());
    }

    public void sendManualReminder(Payment payment) {
        Optional<Member> memberOpt = memberRepo.findById(payment.getMemberId());
        if (memberOpt.isEmpty()) return;
        Member member = memberOpt.get();

        try {
            Map<String, Object> msg = Map.of(
                    "type", "PAYMENT_REMINDER_MANUAL",
                    "memberId", member.getId().toString(),
                    "memberName", member.getFirstName() + " " + member.getLastName(),
                    "memberEmail", member.getEmail(),
                    "paymentNumber", payment.getPaymentNumber(),
                    "amountDue", payment.getFinalAmountLkr()
            );
            rabbitTemplate.convertAndSend("gym.notifications", "notification.billing.reminder", msg);

            PaymentReminder reminder = new PaymentReminder();
            reminder.setGymId(payment.getGymId());
            reminder.setMemberId(member.getId());
            reminder.setPaymentId(payment.getId());
            reminder.setReminderType(ReminderType.PAYMENT_OVERDUE);
            reminder.setChannel("WHATSAPP");
            reminderRepo.save(reminder);
        } catch (Exception e) {
            log.warn("Failed to send manual reminder: {}", e.getMessage());
        }
    }
}
