package com.gymapp.modules.branch;

import com.gymapp.modules.branch.dto.BranchRequest;
import com.gymapp.modules.branch.dto.BranchResponse;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER', 'MEMBER')")
    public ResponseEntity<ApiResponse<List<BranchResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(branchService.listBranches()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<BranchResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(branchService.getBranch(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<BranchResponse>> create(
            @Valid @RequestBody BranchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(branchService.createBranch(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<BranchResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody BranchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Branch updated", branchService.updateBranch(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GYM_OWNER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        branchService.deleteBranch(id);
        return ResponseEntity.ok(ApiResponse.ok("Branch deactivated", null));
    }
}
