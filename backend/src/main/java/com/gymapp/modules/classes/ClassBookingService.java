package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.*;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassBookingService {

    private final ClassBookingRepository   bookingRepository;
    private final ClassSessionRepository   sessionRepository;
    private final FitnessClassRepository   classRepository;
    private final MemberRepository         memberRepository;
    private final ClassNotificationService notificationService;
    private final WaitlistService          waitlistService;

    @Transactional
    public ClassBookingDTO bookClass(UUID sessionId, UUID memberId) {
        UUID gymId = TenantContext.getGymId();

        ClassSession session = sessionRepository.findByIdAndGymId(sessionId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Session not found"));

        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new IllegalStateException("Session is not open for booking");
        }

        if (bookingRepository.existsBySessionIdAndMemberIdAndStatusNot(
                sessionId, memberId, BookingStatus.CANCELLED)) {
            throw new IllegalStateException("Member is already booked or waitlisted for this session");
        }

        int booked = sessionRepository.countBookedBySessionId(sessionId);
        if (booked >= session.getActualCapacity()) {
            return waitlistService.joinWaitlist(sessionId, memberId, gymId);
        }

        ClassBooking booking = new ClassBooking();
        booking.setGymId(gymId);
        booking.setSessionId(sessionId);
        booking.setMemberId(memberId);
        booking.setStatus(BookingStatus.BOOKED);
        booking.setBookedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        FitnessClass fc = classRepository.findById(session.getClassId()).orElse(null);
        Member member   = memberRepository.findById(memberId).orElse(null);
        if (member != null && fc != null) {
            notificationService.sendBookingConfirmation(member, session, fc);
        }

        return toDTO(booking, member);
    }

    @Transactional
    public ClassBookingDTO cancelBooking(UUID bookingId, CancelBookingRequest req) {
        UUID gymId = TenantContext.getGymId();
        ClassBooking booking = bookingRepository.findByIdAndGymId(bookingId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }

        ClassSession session = sessionRepository.findById(booking.getSessionId()).orElseThrow();
        LocalDateTime classStart = session.getSessionDate().atTime(session.getStartTime());
        if (LocalDateTime.now().isAfter(classStart.minusHours(1))) {
            throw new IllegalStateException("Cannot cancel within 1 hour of class start");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelReason(req.reason());
        bookingRepository.save(booking);

        FitnessClass fc = classRepository.findById(session.getClassId()).orElse(null);
        Member member   = memberRepository.findById(booking.getMemberId()).orElse(null);
        if (member != null && fc != null) {
            notificationService.sendCancellationByMember(member, session, fc);
        }

        waitlistService.promoteFromWaitlist(session.getId());

        return toDTO(booking, member);
    }

    public List<ClassBookingDTO> getSessionBookings(UUID sessionId) {
        return bookingRepository.findAllBySessionId(sessionId)
            .stream().map(b -> {
                Member m = memberRepository.findById(b.getMemberId()).orElse(null);
                return toDTO(b, m);
            }).toList();
    }

    public Page<MemberUpcomingClassDTO> getMemberUpcoming(UUID memberId, int page, int size) {
        Pageable pbl = PageRequest.of(page, size, Sort.by("bookedAt").ascending());
        return bookingRepository
            .findAllByMemberIdAndStatusIn(memberId, List.of(BookingStatus.BOOKED, BookingStatus.WAITLISTED), pbl)
            .map(b -> toUpcomingDTO(b));
    }

    public Page<ClassBookingDTO> getMemberHistory(UUID memberId, int page, int size) {
        Pageable pbl = PageRequest.of(page, size, Sort.by("bookedAt").descending());
        return bookingRepository
            .findAllByMemberIdAndStatusIn(memberId,
                List.of(BookingStatus.ATTENDED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW), pbl)
            .map(b -> toDTO(b, memberRepository.findById(b.getMemberId()).orElse(null)));
    }

    public int getWaitlistPosition(UUID sessionId, UUID memberId) {
        return waitlistService.getWaitlist(sessionId).stream()
            .filter(w -> w.getMemberId().equals(memberId))
            .map(w -> w.getPosition())
            .findFirst().orElse(-1);
    }

    @Transactional
    public ClassBookingDTO markAttended(UUID bookingId) {
        UUID gymId = TenantContext.getGymId();
        ClassBooking b = bookingRepository.findByIdAndGymId(bookingId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Booking not found"));
        b.setStatus(BookingStatus.ATTENDED);
        b.setAttendedAt(LocalDateTime.now());
        return toDTO(bookingRepository.save(b), memberRepository.findById(b.getMemberId()).orElse(null));
    }

    @Transactional
    public ClassBookingDTO markNoShow(UUID bookingId) {
        UUID gymId = TenantContext.getGymId();
        ClassBooking b = bookingRepository.findByIdAndGymId(bookingId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Booking not found"));
        b.setStatus(BookingStatus.NO_SHOW);
        return toDTO(bookingRepository.save(b), memberRepository.findById(b.getMemberId()).orElse(null));
    }

    @Transactional
    public void markAllAttended(UUID sessionId) {
        UUID gymId = TenantContext.getGymId();
        sessionRepository.findByIdAndGymId(sessionId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Session not found"));
        bookingRepository.findAllBySessionIdAndStatus(sessionId, BookingStatus.BOOKED)
            .forEach(b -> {
                b.setStatus(BookingStatus.ATTENDED);
                b.setAttendedAt(LocalDateTime.now());
                bookingRepository.save(b);
            });
        log.info("Marked all bookings as ATTENDED for session {}", sessionId);
    }

    private ClassBookingDTO toDTO(ClassBooking b, Member member) {
        return new ClassBookingDTO(
            b.getId(), b.getSessionId(), b.getMemberId(),
            member != null ? member.getFirstName() + " " + member.getLastName() : null,
            member != null ? member.getPhone() : null,
            b.getStatus(), b.getBookedAt(), b.getCancelledAt(),
            b.getCancelReason(), b.getWaitlistPosition(), b.getAttendedAt());
    }

    private MemberUpcomingClassDTO toUpcomingDTO(ClassBooking b) {
        ClassSession session = sessionRepository.findById(b.getSessionId()).orElse(null);
        FitnessClass fc      = session != null ? classRepository.findById(session.getClassId()).orElse(null) : null;
        long hours = 0;
        if (session != null) {
            LocalDateTime start = session.getSessionDate().atTime(session.getStartTime());
            hours = ChronoUnit.HOURS.between(LocalDateTime.now(), start);
            if (hours < 0) hours = 0;
        }
        return new MemberUpcomingClassDTO(
            session != null ? session.getId() : null,
            b.getId(),
            fc != null ? fc.getName() : null,
            fc != null ? fc.getType() : null,
            fc != null ? fc.getColor() : null,
            null,
            session != null ? session.getSessionDate() : null,
            session != null ? session.getStartTime() : null,
            session != null ? session.getEndTime() : null,
            fc != null ? fc.getRoom() : null,
            b.getStatus(),
            hours);
    }
}
