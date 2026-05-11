package com.gymapp.modules.member;

import com.gymapp.shared.enums.MemberStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class MemberExpiryScheduler {

    private final MemberRepository memberRepository;

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void updateExpiredStatuses() {
        LocalDate today = LocalDate.now();
        List<UUID> gymIds = memberRepository.findAll().stream()
            .map(Member::getGymId).distinct().toList();

        for (UUID gymId : gymIds) {
            List<Member> expired = memberRepository.findExpiredNotUpdated(gymId, today);
            for (Member m : expired) {
                m.setStatus(MemberStatus.EXPIRED);
            }
            if (!expired.isEmpty()) {
                memberRepository.saveAll(expired);
                log.info("Marked {} members as EXPIRED for gym {}", expired.size(), gymId);
            }
        }
    }

    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void markExpiringMembers() {
        LocalDate today = LocalDate.now();
        LocalDate in7days = today.plusDays(7);
        List<UUID> gymIds = memberRepository.findAll().stream()
            .map(Member::getGymId).distinct().toList();

        for (UUID gymId : gymIds) {
            List<Member> expiring = memberRepository.findExpiringMembers(gymId, today, in7days);
            for (Member m : expiring) {
                if (m.getStatus() == MemberStatus.ACTIVE) {
                    m.setStatus(MemberStatus.EXPIRING);
                }
            }
            if (!expiring.isEmpty()) {
                memberRepository.saveAll(expiring);
                log.info("Marked {} members as EXPIRING for gym {}", expiring.size(), gymId);
            }
        }
    }
}
