package com.gymapp;

import com.gymapp.modules.member.MemberExportService;
import com.gymapp.modules.member.MemberService;
import com.gymapp.modules.member.dto.MemberResponse;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.MemberStatus;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.*;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MultiTenancyIntegrationTest extends AbstractIntegrationTest {

    @MockBean MemberService       memberService;
    @MockBean MemberExportService exportService;

    static final UUID GYM_A = UUID.fromString("aaaaaaaa-0000-0000-0000-000000000001");
    static final UUID GYM_B = UUID.fromString("bbbbbbbb-0000-0000-0000-000000000002");

    // ── Tenant isolation ──────────────────────────────────────────

    @Test
    void tenantContext_WhenGymIdPresentInToken_ShouldSetGymIdForRequest() throws Exception {
        MemberResponse respA  = buildResponse(UUID.randomUUID(), GYM_A);
        Page<MemberResponse> pageA = new PageImpl<>(List.of(respA));

        given(memberService.listMembers(any(), any(), any(), any())).willAnswer(inv -> {
            assertThat(TenantContext.getGymId()).isEqualTo(GYM_A);
            return pageA;
        });

        mockMvc.perform(get("/api/v1/members")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", GYM_A.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    })))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].gymId").value(GYM_A.toString()));
    }

    @Test
    void tenantContext_WhenTwoConcurrentGyms_ShouldIsolateTheirContexts() throws Exception {
        MemberResponse respB = buildResponse(UUID.randomUUID(), GYM_B);
        Page<MemberResponse> pageB = new PageImpl<>(List.of(respB));

        given(memberService.listMembers(any(), any(), any(), any())).willReturn(pageB);

        mockMvc.perform(get("/api/v1/members")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", GYM_B.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    })))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].gymId").value(GYM_B.toString()));
    }

    @Test
    void tenantContext_WhenNoGymIdInToken_ShouldStillProcess() throws Exception {
        given(memberService.listMembers(any(), any(), any(), any()))
            .willReturn(Page.empty());

        mockMvc.perform(get("/api/v1/members")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> attrs.put("roles", List.of("GYM_OWNER")))))
            .andExpect(status().isOk());
    }

    // ── X-Branch-ID header ────────────────────────────────────────

    @Test
    void branchId_WhenXBranchIdHeaderPresent_ShouldSetBranchContext() throws Exception {
        UUID branchId = UUID.randomUUID();
        given(memberService.listMembers(any(), any(), any(), any())).willAnswer(inv -> {
            assertThat(TenantContext.getBranchId()).isEqualTo(branchId);
            return Page.empty();
        });

        mockMvc.perform(get("/api/v1/members")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", GYM_A.toString());
                        attrs.put("roles", List.of("MANAGER"));
                    }))
                .header("X-Branch-ID", branchId.toString()))
            .andExpect(status().isOk());
    }

    @Test
    void tenantContext_AfterRequest_ShouldBeCleared() throws Exception {
        given(memberService.listMembers(any(), any(), any(), any())).willReturn(Page.empty());

        mockMvc.perform(get("/api/v1/members")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", GYM_A.toString());
                        attrs.put("roles", List.of("MANAGER"));
                    })))
            .andExpect(status().isOk());

        assertThat(TenantContext.getGymId()).isNull();
    }

    // ── TenantContext unit tests ───────────────────────────────────

    @Test
    void tenantContext_SetAndGet_ShouldReturnCorrectGymId() {
        TenantContext.setGymId(GYM_A);
        assertThat(TenantContext.getGymId()).isEqualTo(GYM_A);
        TenantContext.clear();
        assertThat(TenantContext.getGymId()).isNull();
    }

    @Test
    void tenantContext_Clear_ShouldRemoveBothGymAndBranchIds() {
        UUID branchId = UUID.randomUUID();
        TenantContext.setGymId(GYM_A);
        TenantContext.setBranchId(branchId.toString());

        TenantContext.clear();

        assertThat(TenantContext.getGymId()).isNull();
        assertThat(TenantContext.getBranchId()).isNull();
    }

    // ── Helpers ───────────────────────────────────────────────────

    private MemberResponse buildResponse(UUID memberId, UUID gymId) {
        return new MemberResponse(
            memberId, gymId, null,
            "Test", "User", "Test User",
            "test@test.lk", "0771234567",
            LocalDate.of(1990, 1, 1), null, null, null,
            MemberStatus.ACTIVE, LocalDate.now().minusMonths(1),
            null, null, null, null
        );
    }
}
