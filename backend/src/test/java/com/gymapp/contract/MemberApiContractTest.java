package com.gymapp.contract;

import com.gymapp.AbstractIntegrationTest;
import com.gymapp.modules.member.MemberService;
import com.gymapp.modules.member.dto.MemberResponse;
import com.gymapp.multitenancy.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class MemberApiContractTest extends AbstractIntegrationTest {

    @MockBean
    private MemberService memberService;

    private static final UUID GYM_ID    = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID BRANCH_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    @BeforeEach
    void setup() {
        TenantContext.setGymId(GYM_ID);
        TenantContext.setBranchId(BRANCH_ID);
    }

    @Test
    void listMembers_responseShouldContainPaginationFields() throws Exception {
        MemberResponse resp = buildMemberResponse();
        when(memberService.listMembers(any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(resp)));

        mockMvc.perform(get("/api/v1/members?page=0&size=20")
                .header("Authorization", "Bearer " + OWNER_TOKEN))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.totalElements").isNumber())
            .andExpect(jsonPath("$.data.totalPages").isNumber())
            .andExpect(jsonPath("$.data.number").isNumber());
    }

    @Test
    void listMembers_eachItemShouldHaveRequiredFields() throws Exception {
        MemberResponse resp = buildMemberResponse();
        when(memberService.listMembers(any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(resp)));

        mockMvc.perform(get("/api/v1/members")
                .header("Authorization", "Bearer " + OWNER_TOKEN))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].id").exists())
            .andExpect(jsonPath("$.data.content[0].fullName").exists())
            .andExpect(jsonPath("$.data.content[0].email").exists())
            .andExpect(jsonPath("$.data.content[0].status").exists())
            .andExpect(jsonPath("$.data.content[0].joinDate").exists());
    }

    @Test
    void getMember_responseShouldContainDetailFields() throws Exception {
        MemberResponse resp = buildMemberResponse();
        when(memberService.getMember(any(UUID.class))).thenReturn(resp);

        mockMvc.perform(get("/api/v1/members/" + resp.id())
                .header("Authorization", "Bearer " + OWNER_TOKEN))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(resp.id().toString()))
            .andExpect(jsonPath("$.data.gymId").exists())
            .andExpect(jsonPath("$.data.createdAt").exists());
    }

    @Test
    void listMembers_unauthorizedShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/members"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void listMembers_memberRoleShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/members")
                .header("Authorization", "Bearer " + MEMBER_TOKEN))
            .andExpect(status().isForbidden());
    }

    private MemberResponse buildMemberResponse() {
        return new MemberResponse(
            UUID.randomUUID(), GYM_ID, BRANCH_ID,
            "Kamal", "Perera", "Kamal Perera",
            "kamal@test.lk", "0771234567", "970101234V",
            null, "ACTIVE", LocalDate.of(2024, 1, 1), LocalDate.of(2026, 1, 1),
            null, null, null, null,
            null, java.time.LocalDateTime.now(), java.time.LocalDateTime.now()
        );
    }
}
