package com.gymapp.modules.branch;

import com.gymapp.modules.branch.dto.BranchRequest;
import com.gymapp.modules.branch.dto.BranchResponse;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    public List<BranchResponse> listBranches() {
        return branchRepository.findAllByGymIdAndActiveTrue(TenantContext.getGymId())
            .stream().map(BranchResponse::from).toList();
    }

    public BranchResponse getBranch(UUID id) {
        return branchRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .map(BranchResponse::from)
            .orElseThrow(() -> new NoSuchElementException("Branch not found"));
    }

    @Transactional
    public BranchResponse createBranch(BranchRequest request) {
        UUID gymId = TenantContext.getGymId();
        if (branchRepository.existsByNameAndGymId(request.name(), gymId)) {
            throw new IllegalStateException("A branch with this name already exists");
        }
        Branch branch = new Branch();
        branch.setGymId(gymId);
        mapRequest(request, branch);
        return BranchResponse.from(branchRepository.save(branch));
    }

    @Transactional
    public BranchResponse updateBranch(UUID id, BranchRequest request) {
        Branch branch = branchRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Branch not found"));
        mapRequest(request, branch);
        return BranchResponse.from(branchRepository.save(branch));
    }

    @Transactional
    public void deleteBranch(UUID id) {
        Branch branch = branchRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Branch not found"));
        branch.setActive(false);
        branchRepository.save(branch);
    }

    private void mapRequest(BranchRequest r, Branch b) {
        b.setName(r.name());
        b.setAddress(r.address());
        b.setPhone(r.phone());
        b.setEmail(r.email());
        b.setOpenTime(r.openTime());
        b.setCloseTime(r.closeTime());
        b.setManagerUserId(r.managerUserId());
    }
}
