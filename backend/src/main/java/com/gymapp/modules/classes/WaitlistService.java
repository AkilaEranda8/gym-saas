package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.ClassBookingDTO;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WaitlistService {

    private final ClassWaitlistRepository  waitlistRepository;
    private final ClassBookingRepository   bookingRepository;
    private final ClassSessionRepository   sessionRepository;
    private final FitnessClassRepository   classRepository;
    private final MemberRepository         memberRepository;
    private final ClassNotificationService notificationService;

    @Transactional
    public ClassBookingDTO joinWaitlist(UUID sessionId, UUID memberId, UUID gymId) {
        if (waitlistRepository.findBySessionIdAndMemberId(sessionId, memberId).isPresent()) {
            throw new IllegalStateException("Already on waitlist for this session");
        }

        int position = (int) waitlistRepository.countBySessionId(sessionId) + 1;

        ClassWaitlist entry = new ClassWaitlist();
        entry.setGymId(gymId);
        entry.setSessionId(sessionId);
        entry.setMemberId(memberId);
        entry.setPosition(position);
        entry.setJoinedAt(LocalDateTime.now());
        waitlistRepository.save(entry);

        ClassSession session = sessionRepository.findById(sessionId).orElseThrow();
        FitnessClass fc      = classRepository.findById(session.getClassId()).orElseThrow();
        memberRepository.findById(memberId).ifPresent(m ->
            notificationService.sendWaitlistJoined(m, session, fc, position));

        ClassBooking stub = new ClassBooking();
        stub.setGymId(gymId);
        stub.setSessionId(sessionId);
        stub.setMemberId(memberId);
        stub.setStatus(BookingStatus.WAITLISTED);
        stub.setWaitlistPosition(position);
        stub.setBookedAt(LocalDateTime.now());
        ClassBooking saved = bookingRepository.save(stub);

        return toDTO(saved, null, null);
    }

    @Transactional
    public void promoteFromWaitlist(UUID sessionId) {
        waitlistRepository.findFirstBySessionIdOrderByPositionAsc(sessionId).ifPresent(entry -> {
            ClassSession session = sessionRepository.findById(sessionId).orElseThrow();
            FitnessClass fc      = classRepository.findById(session.getClassId()).orElseThrow();
            UUID memberId        = entry.getMemberId();

            bookingRepository.findBySessionIdAndMemberId(sessionId, memberId).ifPresent(b -> {
                b.setStatus(BookingStatus.BOOKED);
                b.setWaitlistPosition(null);
                bookingRepository.save(b);
            });

            waitlistRepository.delete(entry);
            reorderWaitlist(sessionId);

            memberRepository.findById(memberId).ifPresent(m ->
                notificationService.sendWaitlistPromotion(m, session, fc));

            log.info("Promoted member {} from waitlist for session {}", memberId, sessionId);
        });
    }

    @Transactional
    public void leaveWaitlist(UUID sessionId, UUID memberId) {
        waitlistRepository.deleteBySessionIdAndMemberId(sessionId, memberId);
        reorderWaitlist(sessionId);

        bookingRepository.findBySessionIdAndMemberId(sessionId, memberId).ifPresent(b -> {
            if (b.getStatus() == BookingStatus.WAITLISTED) {
                bookingRepository.delete(b);
            }
        });
    }

    public List<ClassWaitlist> getWaitlist(UUID sessionId) {
        return waitlistRepository.findAllBySessionIdOrderByPosition(sessionId);
    }

    private void reorderWaitlist(UUID sessionId) {
        List<ClassWaitlist> list = waitlistRepository.findAllBySessionIdOrderByPosition(sessionId);
        for (int i = 0; i < list.size(); i++) {
            ClassWaitlist w = list.get(i);
            w.setPosition(i + 1);
            bookingRepository.findBySessionIdAndMemberId(sessionId, w.getMemberId()).ifPresent(b -> {
                b.setWaitlistPosition(w.getPosition());
                bookingRepository.save(b);
            });
        }
        waitlistRepository.saveAll(list);
    }

    private ClassBookingDTO toDTO(ClassBooking b, String memberName, String memberPhone) {
        return new ClassBookingDTO(
            b.getId(), b.getSessionId(), b.getMemberId(),
            memberName, memberPhone,
            b.getStatus(), b.getBookedAt(), b.getCancelledAt(),
            b.getCancelReason(), b.getWaitlistPosition(), b.getAttendedAt());
    }

    public Member findMember(UUID memberId) {
        return memberRepository.findById(memberId).orElseThrow(
            () -> new java.util.NoSuchElementException("Member not found"));
    }
}
