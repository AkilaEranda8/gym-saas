package com.gymapp.modules.member;

import com.gymapp.modules.member.dto.PlanRequest;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<Plan> listPlans() {
        return planRepository.findAllByGymIdAndActiveTrue(TenantContext.getGymId());
    }

    @Transactional
    public Plan createPlan(PlanRequest request) {
        UUID gymId = TenantContext.getGymId();
        if (planRepository.existsByNameAndGymId(request.name(), gymId)) {
            throw new IllegalStateException("A plan with this name already exists");
        }
        Plan plan = new Plan();
        plan.setGymId(gymId);
        applyRequest(request, plan);
        return planRepository.save(plan);
    }

    @Transactional
    public Plan updatePlan(UUID id, PlanRequest request) {
        Plan plan = planRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Plan not found"));
        applyRequest(request, plan);
        return planRepository.save(plan);
    }

    @Transactional
    public void deactivatePlan(UUID id) {
        Plan plan = planRepository.findByIdAndGymId(id, TenantContext.getGymId())
            .orElseThrow(() -> new NoSuchElementException("Plan not found"));
        plan.setActive(false);
        planRepository.save(plan);
    }

    private void applyRequest(PlanRequest r, Plan p) {
        p.setName(r.name());
        p.setDescription(r.description());
        p.setDurationDays(r.durationDays());
        p.setPrice(r.price());
        p.setFeatures(r.features());
        if (r.maxFreezeDays() != null) p.setMaxFreezeDays(r.maxFreezeDays());
    }
}
