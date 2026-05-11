package com.gymapp.modules.group;

import com.gymapp.shared.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<List<GroupService.GroupResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(groupService.listGroups()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<GroupService.GroupResponse>> create(
            @RequestBody GroupService.GroupRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(groupService.createGroup(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<GroupService.GroupResponse>> update(
            @PathVariable UUID id, @RequestBody GroupService.GroupRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.updateGroup(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(ApiResponse.ok("Group deleted", null));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<List<UUID>>> members(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.getGroupMemberIds(id)));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> addMember(
            @PathVariable UUID id, @RequestBody GroupService.MemberIdRequest req) {
        groupService.addMember(id, req.memberId());
        return ResponseEntity.ok(ApiResponse.ok("Member added to group", null));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID id, @PathVariable UUID memberId) {
        groupService.removeMember(id, memberId);
        return ResponseEntity.ok(ApiResponse.ok("Member removed from group", null));
    }
}
