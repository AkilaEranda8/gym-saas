package com.gymapp.modules.member;

import com.gymapp.AbstractIntegrationTest;
import com.gymapp.TestDataFactory;
import com.gymapp.modules.member.dto.*;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.enums.MemberStatus;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MemberApiIntegrationTest extends AbstractIntegrationTest {

    @MockBean MemberService       memberService;
    @MockBean MemberExportService exportService;

    static final UUID MEMBER_ID = UUID.randomUUID();

    @BeforeEach
    void setTenant() {
        TenantContext.setGymId(TEST_GYM_ID);
    }

    // ── GET /api/v1/members ───────────────────────────────────────

    @Test
    void listMembers_AuthorizedRequest_ShouldReturn200WithPage() throws Exception {
        MemberResponse resp = buildMemberResponse(MEMBER_ID);
        Page<MemberResponse> page = new PageImpl<>(List.of(resp));
        given(memberService.listMembers(any(), any(), any(), any())).willReturn(page);

        mockMvc.perform(get("/api/v1/members")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    }))
                .contentType(JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content[0].id").value(MEMBER_ID.toString()));
    }

    @Test
    void listMembers_UnauthenticatedRequest_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/members"))
            .andExpect(status().isUnauthorized());
    }

    // ── GET /api/v1/members/{id} ──────────────────────────────────

    @Test
    void getMember_WhenExists_ShouldReturn200() throws Exception {
        MemberResponse resp = buildMemberResponse(MEMBER_ID);
        given(memberService.getMember(MEMBER_ID)).willReturn(resp);

        mockMvc.perform(get("/api/v1/members/{id}", MEMBER_ID)
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    })))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(MEMBER_ID.toString()))
            .andExpect(jsonPath("$.data.firstName").value("Kamal"));
    }

    @Test
    void getMember_WhenNotFound_ShouldReturn404() throws Exception {
        given(memberService.getMember(any(UUID.class)))
            .willThrow(new NoSuchElementException("Member not found"));

        mockMvc.perform(get("/api/v1/members/{id}", UUID.randomUUID())
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    })))
            .andExpect(status().isNotFound());
    }

    // ── POST /api/v1/members ──────────────────────────────────────

    @Test
    void createMember_WithValidPayload_ShouldReturn201() throws Exception {
        MemberRequest req = TestDataFactory.createMemberRequest();
        MemberResponse resp = buildMemberResponse(UUID.randomUUID());
        given(memberService.createMember(any(MemberRequest.class))).willReturn(resp);

        mockMvc.perform(post("/api/v1/members")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    }))
                .contentType(JSON)
                .content(toJson(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createMember_WithDuplicateEmail_ShouldReturn409() throws Exception {
        MemberRequest req = TestDataFactory.createMemberRequest();
        given(memberService.createMember(any()))
            .willThrow(new IllegalStateException("A member with this email already exists"));

        mockMvc.perform(post("/api/v1/members")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    }))
                .contentType(JSON)
                .content(toJson(req)))
            .andExpect(status().isConflict());
    }

    // ── POST /api/v1/members/check-in ─────────────────────────────

    @Test
    void checkIn_WithValidMemberId_ShouldReturn200WithSuccess() throws Exception {
        CheckInRequest req = new CheckInRequest(null, MEMBER_ID, CheckInMethod.MANUAL);
        CheckInResponse resp = new CheckInResponse(
            MEMBER_ID, "Kamal Perera", "STANDARD", MemberStatus.ACTIVE.name(),
            java.time.LocalDateTime.now(), "Welcome, Kamal!", true
        );
        given(memberService.checkIn(any(CheckInRequest.class))).willReturn(resp);

        mockMvc.perform(post("/api/v1/members/check-in")
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("MANAGER"));
                    }))
                .contentType(JSON)
                .content(toJson(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.success").value(true))
            .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    // ── DELETE /api/v1/members/{id} ───────────────────────────────

    @Test
    void deleteMember_ByOwner_ShouldReturn204() throws Exception {
        doNothing().when(memberService).deleteMember(any(UUID.class));

        mockMvc.perform(delete("/api/v1/members/{id}", MEMBER_ID)
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("GYM_OWNER"));
                    })))
            .andExpect(status().isNoContent());
    }

    @Test
    void deleteMember_ByTrainer_ShouldReturn403() throws Exception {
        mockMvc.perform(delete("/api/v1/members/{id}", MEMBER_ID)
                .with(SecurityMockMvcRequestPostProcessors.opaqueToken()
                    .attributes(attrs -> {
                        attrs.put("gym_id", TEST_GYM_ID.toString());
                        attrs.put("roles", List.of("TRAINER"));
                    })))
            .andExpect(status().isForbidden());
    }

    // ── Helpers ───────────────────────────────────────────────────

    private MemberResponse buildMemberResponse(UUID id) {
        return new MemberResponse(
            id, TEST_GYM_ID, null,
            "Kamal", "Perera", "Kamal Perera",
            "kamal@test.lk", "0771234567",
            LocalDate.of(1990, 1, 1), null, null, null,
            MemberStatus.ACTIVE, LocalDate.now().minusMonths(6),
            null, null, null, null
        );
    }
}
