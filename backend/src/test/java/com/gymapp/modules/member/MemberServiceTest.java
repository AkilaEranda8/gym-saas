package com.gymapp.modules.member;

import com.gymapp.modules.member.dto.*;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.MemberStatus;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock MemberRepository     memberRepository;
    @Mock PlanRepository       planRepository;
    @Mock MemberPlanRepository memberPlanRepository;
    @Mock BodyMetricRepository bodyMetricRepository;
    @Mock AttendanceRepository attendanceRepository;
    @Mock QrCodeService        qrCodeService;

    @InjectMocks MemberService memberService;

    static final UUID GYM_ID    = UUID.randomUUID();
    static final UUID MEMBER_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setGymId(GYM_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── createMember ──────────────────────────────────────────────

    @Test
    void create_WhenValidRequest_ShouldSaveMemberAndReturnResponse() {
        MemberRequest req = new MemberRequest(
            "Kamal", "Perera", "kamal@test.lk", "0771234567",
            LocalDate.of(1990, 1, 1), null, null, null, null, null, null
        );

        Member saved = buildMember(MEMBER_ID, "Kamal", "Perera", "kamal@test.lk", MemberStatus.ACTIVE);
        given(memberRepository.existsByEmailAndGymId(req.email(), GYM_ID)).willReturn(false);
        given(memberRepository.existsByPhoneAndGymId(req.phone(), GYM_ID)).willReturn(false);
        given(memberRepository.save(any(Member.class))).willReturn(saved);
        given(qrCodeService.generateMemberQrData(anyString(), anyString())).willReturn("QR_DATA");

        MemberResponse result = memberService.createMember(req);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(MEMBER_ID);
        assertThat(result.firstName()).isEqualTo("Kamal");
        verify(memberRepository, times(2)).save(any(Member.class));
    }

    @Test
    void create_WhenDuplicateEmail_ShouldThrowIllegalStateException() {
        MemberRequest req = new MemberRequest(
            "Nimesha", "Silva", "dup@test.lk", "0779876543",
            null, null, null, null, null, null, null
        );
        given(memberRepository.existsByEmailAndGymId("dup@test.lk", GYM_ID)).willReturn(true);

        assertThatThrownBy(() -> memberService.createMember(req))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("email already exists");

        verify(memberRepository, never()).save(any());
    }

    @Test
    void create_WhenDuplicatePhone_ShouldThrowIllegalStateException() {
        MemberRequest req = new MemberRequest(
            "Dinesh", "Fernando", "dinesh@test.lk", "0771112222",
            null, null, null, null, null, null, null
        );
        given(memberRepository.existsByEmailAndGymId("dinesh@test.lk", GYM_ID)).willReturn(false);
        given(memberRepository.existsByPhoneAndGymId("0771112222", GYM_ID)).willReturn(true);

        assertThatThrownBy(() -> memberService.createMember(req))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("phone already exists");

        verify(memberRepository, never()).save(any());
    }

    // ── getMember ─────────────────────────────────────────────────

    @Test
    void getMember_WhenExists_ShouldReturnResponse() {
        Member m = buildMember(MEMBER_ID, "Sunil", "Rathnayake", "sunil@test.lk", MemberStatus.ACTIVE);
        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(m));

        MemberResponse result = memberService.getMember(MEMBER_ID);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(MEMBER_ID);
        assertThat(result.firstName()).isEqualTo("Sunil");
    }

    @Test
    void getMember_WhenNotFound_ShouldThrowNoSuchElementException() {
        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> memberService.getMember(MEMBER_ID))
            .isInstanceOf(NoSuchElementException.class)
            .hasMessageContaining("Member not found");
    }

    // ── deleteMember (soft delete) ────────────────────────────────

    @Test
    void delete_WhenMemberExists_ShouldSoftDeleteAndSetInactive() {
        Member m = buildMember(MEMBER_ID, "Amara", "Jayasinghe", "amara@test.lk", MemberStatus.ACTIVE);
        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(m));

        ArgumentCaptor<Member> captor = ArgumentCaptor.forClass(Member.class);
        given(memberRepository.save(captor.capture())).willReturn(m);

        memberService.deleteMember(MEMBER_ID);

        Member saved = captor.getValue();
        assertThat(saved.getDeletedAt()).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(MemberStatus.INACTIVE);
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    void delete_WhenNotFound_ShouldThrow() {
        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.empty());

        assertThatThrownBy(() -> memberService.deleteMember(MEMBER_ID))
            .isInstanceOf(NoSuchElementException.class);
    }

    // ── suspendMember / reactivateMember ──────────────────────────

    @Test
    void suspend_WhenActive_ShouldSetSuspendedStatus() {
        Member m = buildMember(MEMBER_ID, "Priya", "Wijesinghe", "priya@test.lk", MemberStatus.ACTIVE);
        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(m));
        given(memberRepository.save(any())).willReturn(m);

        MemberResponse result = memberService.suspendMember(MEMBER_ID);

        assertThat(m.getStatus()).isEqualTo(MemberStatus.SUSPENDED);
        verify(memberRepository).save(m);
    }

    @Test
    void reactivate_WhenSuspended_ShouldSetActiveStatus() {
        Member m = buildMember(MEMBER_ID, "Ruwan", "Bandara", "ruwan@test.lk", MemberStatus.SUSPENDED);
        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(m));
        given(memberRepository.save(any())).willReturn(m);

        memberService.reactivateMember(MEMBER_ID);

        assertThat(m.getStatus()).isEqualTo(MemberStatus.ACTIVE);
    }

    // ── checkIn ───────────────────────────────────────────────────

    @Test
    void checkIn_WhenActiveMemberById_ShouldCreateAttendanceAndReturnSuccess() {
        Member m = buildMember(MEMBER_ID, "Kasun", "Kumara", "kasun@test.lk", MemberStatus.ACTIVE);
        CheckInRequest req = new CheckInRequest(null, MEMBER_ID, CheckInMethod.MANUAL);

        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(m));
        given(attendanceRepository.findByGymIdAndMemberIdAndCheckOutTimeIsNull(GYM_ID, MEMBER_ID))
            .willReturn(Optional.empty());
        given(attendanceRepository.save(any(Attendance.class))).willAnswer(inv -> {
            Attendance a = inv.getArgument(0);
            a.setCheckInTime(LocalDateTime.now());
            return a;
        });

        CheckInResponse resp = memberService.checkIn(req);

        assertThat(resp.success()).isTrue();
        assertThat(resp.status()).isEqualTo(MemberStatus.ACTIVE.name());
        assertThat(resp.checkInTime()).isNotNull();
        verify(attendanceRepository).save(any(Attendance.class));
    }

    @Test
    void checkIn_WhenMemberExpired_ShouldReturnFailureNotThrow() {
        Member m = buildMember(MEMBER_ID, "Expired", "Member", "exp@test.lk", MemberStatus.EXPIRED);
        CheckInRequest req = new CheckInRequest(null, MEMBER_ID, CheckInMethod.MANUAL);

        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(m));

        CheckInResponse resp = memberService.checkIn(req);

        assertThat(resp.success()).isFalse();
        assertThat(resp.status()).isEqualTo("EXPIRED");
        assertThat(resp.message()).containsIgnoringCase("expired");
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void checkIn_WhenAlreadyCheckedIn_ShouldReturnAlreadyCheckedInMessage() {
        Member m = buildMember(MEMBER_ID, "Double", "CheckIn", "double@test.lk", MemberStatus.ACTIVE);
        CheckInRequest req = new CheckInRequest(null, MEMBER_ID, CheckInMethod.MANUAL);
        Attendance existing = new Attendance();
        existing.setMemberId(MEMBER_ID);
        existing.setCheckInTime(LocalDateTime.now().minusHours(1));

        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(m));
        given(attendanceRepository.findByGymIdAndMemberIdAndCheckOutTimeIsNull(GYM_ID, MEMBER_ID))
            .willReturn(Optional.of(existing));

        CheckInResponse resp = memberService.checkIn(req);

        assertThat(resp.success()).isFalse();
        assertThat(resp.message()).containsIgnoringCase("already checked in");
        verify(attendanceRepository, never()).save(any());
    }

    @Test
    void checkIn_WithQrCode_ShouldLookupByEmbeddedMemberId() {
        String qrCode = "GYM:" + MEMBER_ID;
        Member m = buildMember(MEMBER_ID, "QR", "User", "qr@test.lk", MemberStatus.ACTIVE);
        CheckInRequest req = new CheckInRequest(qrCode, null, CheckInMethod.QR);

        given(memberRepository.findByIdAndGymId(MEMBER_ID, GYM_ID)).willReturn(Optional.of(m));
        given(attendanceRepository.findByGymIdAndMemberIdAndCheckOutTimeIsNull(GYM_ID, MEMBER_ID))
            .willReturn(Optional.empty());
        given(attendanceRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        CheckInResponse resp = memberService.checkIn(req);

        assertThat(resp.success()).isTrue();
    }

    @Test
    void checkIn_WhenNeitherQrNorMemberId_ShouldThrowIllegalArgumentException() {
        CheckInRequest req = new CheckInRequest(null, null, null);

        assertThatThrownBy(() -> memberService.checkIn(req))
            .isInstanceOf(IllegalArgumentException.class);
    }

    // ── listMembers ───────────────────────────────────────────────

    @Test
    void listMembers_ShouldDelegateToRepository() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Member> emptyPage = new PageImpl<>(List.of());
        given(memberRepository.searchMembers(eq(GYM_ID), anyString(), isNull(), isNull(), eq(pageable)))
            .willReturn(emptyPage);

        Page<MemberResponse> result = memberService.listMembers(null, null, null, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(0);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Member buildMember(UUID id, String first, String last, String email, MemberStatus status) {
        Member m = new Member();
        m.setId(id);
        m.setGymId(GYM_ID);
        m.setFirstName(first);
        m.setLastName(last);
        m.setEmail(email);
        m.setStatus(status);
        m.setJoinDate(LocalDate.now());
        return m;
    }
}
