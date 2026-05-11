package com.gymapp.modules.member;

import com.gymapp.shared.enums.MemberStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class MemberExpirySchedulerTest {

    @Mock MemberRepository memberRepository;

    @InjectMocks MemberExpiryScheduler scheduler;

    static final UUID GYM_ID = UUID.randomUUID();

    // ── updateExpiredStatuses ─────────────────────────────────────

    @Test
    void updateExpiredStatuses_WhenExpiredMembersExist_ShouldMarkThemExpired() {
        Member m1 = buildMember(UUID.randomUUID(), MemberStatus.ACTIVE, LocalDate.now().minusDays(1));
        Member m2 = buildMember(UUID.randomUUID(), MemberStatus.EXPIRING, LocalDate.now().minusDays(3));

        given(memberRepository.findAll()).willReturn(List.of(m1, m2));
        given(memberRepository.findExpiredNotUpdated(eq(GYM_ID), any(LocalDate.class)))
            .willReturn(List.of(m1, m2));
        given(memberRepository.saveAll(anyList())).willAnswer(inv -> inv.getArgument(0));

        scheduler.updateExpiredStatuses();

        assertThat(m1.getStatus()).isEqualTo(MemberStatus.EXPIRED);
        assertThat(m2.getStatus()).isEqualTo(MemberStatus.EXPIRED);
        verify(memberRepository).saveAll(List.of(m1, m2));
    }

    @Test
    void updateExpiredStatuses_WhenNoExpiredMembers_ShouldNotCallSaveAll() {
        Member m = buildMember(UUID.randomUUID(), MemberStatus.ACTIVE, LocalDate.now().plusDays(5));

        given(memberRepository.findAll()).willReturn(List.of(m));
        given(memberRepository.findExpiredNotUpdated(eq(GYM_ID), any(LocalDate.class)))
            .willReturn(List.of());

        scheduler.updateExpiredStatuses();

        verify(memberRepository, never()).saveAll(any());
    }

    @Test
    void updateExpiredStatuses_WhenNoMembers_ShouldNotInteractWithRepository() {
        given(memberRepository.findAll()).willReturn(List.of());

        scheduler.updateExpiredStatuses();

        verify(memberRepository, never()).findExpiredNotUpdated(any(), any());
        verify(memberRepository, never()).saveAll(any());
    }

    @Test
    void updateExpiredStatuses_WhenMultipleGyms_ShouldProcessEachGymSeparately() {
        UUID gym1 = UUID.randomUUID();
        UUID gym2 = UUID.randomUUID();
        Member m1 = buildMemberForGym(gym1, MemberStatus.ACTIVE, LocalDate.now().minusDays(1));
        Member m2 = buildMemberForGym(gym2, MemberStatus.ACTIVE, LocalDate.now().minusDays(2));

        given(memberRepository.findAll()).willReturn(List.of(m1, m2));
        given(memberRepository.findExpiredNotUpdated(eq(gym1), any())).willReturn(List.of(m1));
        given(memberRepository.findExpiredNotUpdated(eq(gym2), any())).willReturn(List.of(m2));
        given(memberRepository.saveAll(anyList())).willAnswer(inv -> inv.getArgument(0));

        scheduler.updateExpiredStatuses();

        verify(memberRepository, times(2)).saveAll(anyList());
        assertThat(m1.getStatus()).isEqualTo(MemberStatus.EXPIRED);
        assertThat(m2.getStatus()).isEqualTo(MemberStatus.EXPIRED);
    }

    // ── markExpiringMembers ───────────────────────────────────────

    @Test
    void markExpiringMembers_WhenActiveMembersExpiringWithin7Days_ShouldMarkAsExpiring() {
        Member m = buildMember(UUID.randomUUID(), MemberStatus.ACTIVE, LocalDate.now().plusDays(5));

        given(memberRepository.findAll()).willReturn(List.of(m));
        given(memberRepository.findExpiringMembers(eq(GYM_ID), any(LocalDate.class), any(LocalDate.class)))
            .willReturn(List.of(m));
        given(memberRepository.saveAll(anyList())).willAnswer(inv -> inv.getArgument(0));

        scheduler.markExpiringMembers();

        assertThat(m.getStatus()).isEqualTo(MemberStatus.EXPIRING);
    }

    @Test
    void markExpiringMembers_WhenSuspendedMemberExpiringSoon_ShouldNotChangeStatus() {
        Member m = buildMember(UUID.randomUUID(), MemberStatus.SUSPENDED, LocalDate.now().plusDays(3));

        given(memberRepository.findAll()).willReturn(List.of(m));
        given(memberRepository.findExpiringMembers(eq(GYM_ID), any(LocalDate.class), any(LocalDate.class)))
            .willReturn(List.of(m));
        given(memberRepository.saveAll(anyList())).willAnswer(inv -> inv.getArgument(0));

        scheduler.markExpiringMembers();

        assertThat(m.getStatus()).isEqualTo(MemberStatus.SUSPENDED);
    }

    @Test
    void markExpiringMembers_WhenNoExpiringMembers_ShouldNotCallSaveAll() {
        Member m = buildMember(UUID.randomUUID(), MemberStatus.ACTIVE, LocalDate.now().plusDays(30));

        given(memberRepository.findAll()).willReturn(List.of(m));
        given(memberRepository.findExpiringMembers(eq(GYM_ID), any(), any())).willReturn(List.of());

        scheduler.markExpiringMembers();

        verify(memberRepository, never()).saveAll(any());
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Member buildMember(UUID id, MemberStatus status, LocalDate expiry) {
        return buildMemberForGym(GYM_ID, status, expiry);
    }

    private Member buildMemberForGym(UUID gymId, MemberStatus status, LocalDate expiry) {
        Member m = new Member();
        m.setId(UUID.randomUUID());
        m.setGymId(gymId);
        m.setFirstName("Test");
        m.setLastName("Member");
        m.setEmail("test" + UUID.randomUUID() + "@test.lk");
        m.setStatus(status);
        m.setJoinDate(LocalDate.now().minusYears(1));
        m.setExpiryDate(expiry);
        return m;
    }
}
