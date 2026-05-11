package com.gymapp.modules.classes;

import com.gymapp.modules.classes.dto.*;
import com.gymapp.modules.member.Member;
import com.gymapp.modules.member.MemberRepository;
import com.gymapp.multitenancy.TenantContext;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class ClassBookingServiceTest {

    @Mock ClassBookingRepository   bookingRepository;
    @Mock ClassSessionRepository   sessionRepository;
    @Mock FitnessClassRepository   classRepository;
    @Mock MemberRepository         memberRepository;
    @Mock ClassNotificationService notificationService;
    @Mock WaitlistService          waitlistService;

    @InjectMocks ClassBookingService bookingService;

    static final UUID GYM_ID    = UUID.randomUUID();
    static final UUID SESSION_ID = UUID.randomUUID();
    static final UUID MEMBER_ID  = UUID.randomUUID();
    static final UUID BOOKING_ID = UUID.randomUUID();
    static final UUID CLASS_ID   = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setGymId(GYM_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── bookClass ─────────────────────────────────────────────────

    @Test
    void bookClass_WhenSpaceAvailable_ShouldCreateBookingWithStatusBooked() {
        ClassSession session = buildSession(10);
        FitnessClass fc = buildClass();
        Member member = buildMember();
        ClassBooking savedBooking = buildBooking(BookingStatus.BOOKED);

        given(sessionRepository.findByIdAndGymId(SESSION_ID, GYM_ID)).willReturn(Optional.of(session));
        given(bookingRepository.existsBySessionIdAndMemberIdAndStatusNot(SESSION_ID, MEMBER_ID, BookingStatus.CANCELLED))
            .willReturn(false);
        given(sessionRepository.countBookedBySessionId(SESSION_ID)).willReturn(3);
        given(bookingRepository.save(any(ClassBooking.class))).willReturn(savedBooking);
        given(classRepository.findById(CLASS_ID)).willReturn(Optional.of(fc));
        given(memberRepository.findById(MEMBER_ID)).willReturn(Optional.of(member));
        doNothing().when(notificationService).sendBookingConfirmation(any(), any(), any());

        ClassBookingDTO result = bookingService.bookClass(SESSION_ID, MEMBER_ID);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(BookingStatus.BOOKED);
        verify(bookingRepository).save(any(ClassBooking.class));
        verify(notificationService).sendBookingConfirmation(any(), any(), any());
    }

    @Test
    void bookClass_WhenSessionFull_ShouldDelegateToWaitlist() {
        ClassSession session = buildSession(5);
        ClassBookingDTO waitlistDTO = new ClassBookingDTO(
            UUID.randomUUID(), SESSION_ID, MEMBER_ID,
            "Kamal Perera", null, BookingStatus.WAITLISTED,
            LocalDateTime.now(), null, null, 1, null
        );

        given(sessionRepository.findByIdAndGymId(SESSION_ID, GYM_ID)).willReturn(Optional.of(session));
        given(bookingRepository.existsBySessionIdAndMemberIdAndStatusNot(SESSION_ID, MEMBER_ID, BookingStatus.CANCELLED))
            .willReturn(false);
        given(sessionRepository.countBookedBySessionId(SESSION_ID)).willReturn(5);
        given(waitlistService.joinWaitlist(SESSION_ID, MEMBER_ID, GYM_ID)).willReturn(waitlistDTO);

        ClassBookingDTO result = bookingService.bookClass(SESSION_ID, MEMBER_ID);

        assertThat(result.status()).isEqualTo(BookingStatus.WAITLISTED);
        assertThat(result.waitlistPosition()).isEqualTo(1);
        verify(waitlistService).joinWaitlist(SESSION_ID, MEMBER_ID, GYM_ID);
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void bookClass_WhenSessionNotScheduled_ShouldThrowIllegalStateException() {
        ClassSession session = buildSession(10);
        session.setStatus(SessionStatus.CANCELLED);

        given(sessionRepository.findByIdAndGymId(SESSION_ID, GYM_ID)).willReturn(Optional.of(session));

        assertThatThrownBy(() -> bookingService.bookClass(SESSION_ID, MEMBER_ID))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("not open for booking");
    }

    @Test
    void bookClass_WhenAlreadyBooked_ShouldThrowIllegalStateException() {
        ClassSession session = buildSession(10);
        given(sessionRepository.findByIdAndGymId(SESSION_ID, GYM_ID)).willReturn(Optional.of(session));
        given(bookingRepository.existsBySessionIdAndMemberIdAndStatusNot(SESSION_ID, MEMBER_ID, BookingStatus.CANCELLED))
            .willReturn(true);

        assertThatThrownBy(() -> bookingService.bookClass(SESSION_ID, MEMBER_ID))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("already booked");
    }

    @Test
    void bookClass_WhenSessionNotFound_ShouldThrowNoSuchElementException() {
        given(sessionRepository.findByIdAndGymId(SESSION_ID, GYM_ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.bookClass(SESSION_ID, MEMBER_ID))
            .isInstanceOf(NoSuchElementException.class)
            .hasMessageContaining("Session not found");
    }

    // ── cancelBooking ─────────────────────────────────────────────

    @Test
    void cancelBooking_WhenMoreThanOneHourBefore_ShouldSuccessfullyCancel() {
        ClassBooking booking = buildBooking(BookingStatus.BOOKED);
        ClassSession session = buildSession(10);
        session.setSessionDate(LocalDate.now().plusDays(1));
        session.setStartTime(LocalTime.of(10, 0));
        FitnessClass fc = buildClass();
        Member member = buildMember();

        given(bookingRepository.findByIdAndGymId(BOOKING_ID, GYM_ID)).willReturn(Optional.of(booking));
        given(sessionRepository.findById(booking.getSessionId())).willReturn(Optional.of(session));
        given(bookingRepository.save(any())).willReturn(booking);
        given(classRepository.findById(CLASS_ID)).willReturn(Optional.of(fc));
        given(memberRepository.findById(MEMBER_ID)).willReturn(Optional.of(member));
        doNothing().when(notificationService).sendCancellationByMember(any(), any(), any());
        doNothing().when(waitlistService).promoteFromWaitlist(any());

        CancelBookingRequest req = new CancelBookingRequest("Changed plans");
        ClassBookingDTO result = bookingService.cancelBooking(BOOKING_ID, req);

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(booking.getCancelReason()).isEqualTo("Changed plans");
        assertThat(booking.getCancelledAt()).isNotNull();
        verify(waitlistService).promoteFromWaitlist(booking.getSessionId());
    }

    @Test
    void cancelBooking_WhenWithinOneHourOfClass_ShouldThrowIllegalStateException() {
        ClassBooking booking = buildBooking(BookingStatus.BOOKED);
        ClassSession session = buildSession(10);
        session.setSessionDate(LocalDate.now());
        session.setStartTime(LocalTime.now().plusMinutes(30));

        given(bookingRepository.findByIdAndGymId(BOOKING_ID, GYM_ID)).willReturn(Optional.of(booking));
        given(sessionRepository.findById(booking.getSessionId())).willReturn(Optional.of(session));

        assertThatThrownBy(() -> bookingService.cancelBooking(BOOKING_ID, new CancelBookingRequest("late")))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("1 hour");
    }

    @Test
    void cancelBooking_WhenAlreadyCancelled_ShouldThrowIllegalStateException() {
        ClassBooking booking = buildBooking(BookingStatus.CANCELLED);
        given(bookingRepository.findByIdAndGymId(BOOKING_ID, GYM_ID)).willReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(BOOKING_ID, new CancelBookingRequest("test")))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("already cancelled");
    }

    // ── Helpers ───────────────────────────────────────────────────

    private ClassSession buildSession(int capacity) {
        ClassSession s = new ClassSession();
        s.setId(SESSION_ID);
        s.setGymId(GYM_ID);
        s.setClassId(CLASS_ID);
        s.setActualCapacity(capacity);
        s.setStatus(SessionStatus.SCHEDULED);
        s.setSessionDate(LocalDate.now().plusDays(2));
        s.setStartTime(LocalTime.of(9, 0));
        s.setEndTime(LocalTime.of(10, 0));
        return s;
    }

    private ClassBooking buildBooking(BookingStatus status) {
        ClassBooking b = new ClassBooking();
        b.setId(BOOKING_ID);
        b.setGymId(GYM_ID);
        b.setSessionId(SESSION_ID);
        b.setMemberId(MEMBER_ID);
        b.setStatus(status);
        b.setBookedAt(LocalDateTime.now());
        return b;
    }

    private FitnessClass buildClass() {
        FitnessClass fc = new FitnessClass();
        fc.setId(CLASS_ID);
        fc.setGymId(GYM_ID);
        fc.setName("Yoga");
        return fc;
    }

    private Member buildMember() {
        Member m = new Member();
        m.setId(MEMBER_ID);
        m.setFirstName("Kamal");
        m.setLastName("Perera");
        return m;
    }
}
