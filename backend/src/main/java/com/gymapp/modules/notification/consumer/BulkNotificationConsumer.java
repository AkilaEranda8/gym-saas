package com.gymapp.modules.notification.consumer;

import com.gymapp.config.RabbitMQConfig;
import com.gymapp.modules.notification.*;
import com.gymapp.modules.notification.enums.*;
import com.gymapp.modules.notification.messaging.NotificationMessage;
import com.gymapp.modules.notification.messaging.NotificationPublisher;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.shared.enums.MemberStatus;
import com.gymapp.modules.trainer.TrainerRepository;
import com.gymapp.modules.trainer.TrainerStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class BulkNotificationConsumer {

    private final BulkNotificationJobRepository jobRepository;
    private final NotificationRepository        notificationRepository;
    private final NotificationPublisher         publisher;
    private final MemberRepository              memberRepository;
    private final TrainerRepository             trainerRepository;
    private final NotificationWebSocketService  wsService;

    @RabbitListener(queues = RabbitMQConfig.BULK_QUEUE)
    @Transactional
    public void process(BulkNotificationJob job) {
        log.info("Processing bulk notification job {} ({})", job.getId(), job.getTargetAudience());

        BulkNotificationJob dbJob = jobRepository.findById(job.getId()).orElse(job);
        dbJob.setStatus(BulkJobStatus.PROCESSING);
        dbJob.setStartedAt(LocalDateTime.now());
        jobRepository.save(dbJob);

        try {
            List<String> recipientIds = resolveRecipients(dbJob);
            dbJob.setTotalRecipients(recipientIds.size());
            jobRepository.save(dbJob);

            int sentCount    = 0;
            int failedCount  = 0;
            List<String> channels = dbJob.getChannels() != null ? dbJob.getChannels() : List.of("PUSH");

            List<List<String>> batches = partitionList(recipientIds, 50);
            for (List<String> batch : batches) {
                for (String recipientId : batch) {
                    try {
                        Notification notification = new Notification();
                        notification.setGymId(dbJob.getGymId());
                        notification.setRecipientId(recipientId);
                        notification.setRecipientType(RecipientType.MEMBER);
                        notification.setType(NotificationType.ANNOUNCEMENT);
                        notification.setTitle(dbJob.getTitle());
                        notification.setMessage(dbJob.getMessage());
                        notification.setChannels(channels);
                        notification.setIsSent(false);
                        Notification saved = notificationRepository.save(notification);

                        for (String channelStr : channels) {
                            try {
                                NotificationChannel channel = NotificationChannel.valueOf(channelStr);
                                NotificationMessage msg = NotificationMessage.builder()
                                    .notificationId(saved.getId().toString())
                                    .gymId(dbJob.getGymId().toString())
                                    .channel(channel)
                                    .recipient(recipientId)
                                    .subject(dbJob.getTitle())
                                    .message(dbJob.getMessage())
                                    .priority(3)
                                    .build();
                                publisher.send(msg);
                            } catch (Exception e) {
                                log.warn("Failed to send {} to {}: {}", channelStr, recipientId, e.getMessage());
                            }
                        }

                        saved.setIsSent(true);
                        saved.setSentAt(LocalDateTime.now());
                        notificationRepository.save(saved);
                        sentCount++;

                    } catch (Exception e) {
                        log.warn("Bulk send failed for recipient {}: {}", recipientId, e.getMessage());
                        failedCount++;
                    }
                }
            }

            dbJob.setSentCount(sentCount);
            dbJob.setFailedCount(failedCount);
            dbJob.setStatus(BulkJobStatus.COMPLETED);
            dbJob.setCompletedAt(LocalDateTime.now());
            jobRepository.save(dbJob);

            if (dbJob.getCreatedBy() != null) {
                notifyCompletion(dbJob);
            }
            log.info("Bulk job {} completed: {}/{} sent", dbJob.getId(), sentCount, recipientIds.size());

        } catch (Exception e) {
            log.error("Bulk job {} failed: {}", dbJob.getId(), e.getMessage());
            dbJob.setStatus(BulkJobStatus.FAILED);
            dbJob.setCompletedAt(LocalDateTime.now());
            jobRepository.save(dbJob);
        }
    }

    private List<String> resolveRecipients(BulkNotificationJob job) {
        return switch (job.getTargetAudience()) {
            case ALL_MEMBERS ->
                memberRepository.findAllByGymId(job.getGymId(), Pageable.unpaged())
                    .stream().map(m -> m.getId().toString()).collect(Collectors.toList());

            case ACTIVE_MEMBERS ->
                memberRepository.findAllByGymIdAndStatus(job.getGymId(), MemberStatus.ACTIVE, Pageable.unpaged())
                    .stream().map(m -> m.getId().toString()).collect(Collectors.toList());

            case EXPIRING_MEMBERS ->
                memberRepository.findExpiringMembers(
                    job.getGymId(), LocalDate.now(), LocalDate.now().plusDays(7))
                    .stream().map(m -> m.getId().toString()).collect(Collectors.toList());

            case SPECIFIC_PLAN ->
                job.getTargetPlan() != null
                    ? memberRepository.findAllByGymId(job.getGymId(), Pageable.unpaged())
                        .stream().map(m -> m.getId().toString()).collect(Collectors.toList())
                    : List.of();

            case ALL_TRAINERS ->
                trainerRepository.findAllByGymIdAndStatus(job.getGymId(), TrainerStatus.ACTIVE)
                    .stream().map(t -> t.getId().toString()).collect(Collectors.toList());

            case ALL_STAFF ->
                trainerRepository.findAllByGymIdAndStatus(job.getGymId(), TrainerStatus.ACTIVE)
                    .stream().map(t -> t.getId().toString()).collect(Collectors.toList());

            case CUSTOM_LIST ->
                job.getTargetIds() != null ? job.getTargetIds() : List.of();
        };
    }

    private void notifyCompletion(BulkNotificationJob job) {
        String summary = String.format(
            "📢 Bulk notification sent!\nTotal: %d\nDelivered: %d\nFailed: %d",
            job.getTotalRecipients(), job.getSentCount(), job.getFailedCount());

        Notification ownerNotif = new Notification();
        ownerNotif.setGymId(job.getGymId());
        ownerNotif.setRecipientId(job.getCreatedBy());
        ownerNotif.setRecipientType(RecipientType.GYM_OWNER);
        ownerNotif.setType(NotificationType.GENERAL);
        ownerNotif.setTitle("Bulk Notification Complete");
        ownerNotif.setMessage(summary);
        ownerNotif.setChannels(List.of("PUSH"));
        ownerNotif.setIsSent(true);
        ownerNotif.setSentAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(ownerNotif);

        try {
            wsService.sendToUser(job.getCreatedBy(),
                new com.gymapp.modules.notification.dto.NotificationDtos.NotificationDTO(
                    saved.getId(), saved.getGymId(), saved.getRecipientId(),
                    saved.getRecipientType().name(), saved.getType().name(),
                    saved.getType().getCategory(), saved.getType().getLabel(),
                    saved.getTitle(), saved.getMessage(), null, saved.getChannels(),
                    false, null, true, saved.getSentAt(), saved.getCreatedAt(), "just now"));
        } catch (Exception e) {
            log.warn("WS notify owner failed: {}", e.getMessage());
        }
    }

    private <T> List<List<T>> partitionList(List<T> list, int size) {
        List<List<T>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            partitions.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return partitions;
    }
}
