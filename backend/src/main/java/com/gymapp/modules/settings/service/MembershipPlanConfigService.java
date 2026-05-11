package com.gymapp.modules.settings.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.entity.MembershipPlanConfig;
import com.gymapp.modules.settings.repository.MembershipPlanConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipPlanConfigService {

    private final MembershipPlanConfigRepository repo;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<MembershipPlanConfigDTO> getAll(UUID gymId) {
        return repo.findAllByGymIdOrderBySortOrder(gymId).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MembershipPlanConfigDTO getByPlan(UUID gymId, String planName) {
        return repo.findByGymIdAndPlanName(gymId, planName.toUpperCase())
            .map(this::toDto)
            .orElseThrow(() -> new NoSuchElementException("Plan not found: " + planName));
    }

    @Transactional
    public MembershipPlanConfigDTO update(UUID gymId, String planName,
                                          UpdateMembershipPlanRequest req) {
        if (req.priceLkr() <= 0) throw new IllegalArgumentException("Price must be greater than 0");
        MembershipPlanConfig cfg = repo.findByGymIdAndPlanName(gymId, planName.toUpperCase())
            .orElseThrow(() -> new NoSuchElementException("Plan not found: " + planName));

        cfg.setDisplayName(req.displayName());
        cfg.setPriceLkr(req.priceLkr());
        cfg.setDurationDays(req.durationDays());
        if (req.color() != null) cfg.setColor(req.color());
        if (req.description() != null) cfg.setDescription(req.description());
        if (req.features() != null) {
            cfg.setFeatures(objectMapper.valueToTree(req.features()));
        }
        if (req.maxClassesPerWeek() != null) cfg.setMaxClassesPerWeek(req.maxClassesPerWeek());
        if (req.maxPtSessions() != null) cfg.setMaxPtSessions(req.maxPtSessions());
        cfg.setLockerIncluded(req.lockerIncluded());
        if (req.guestPasses() != null) cfg.setGuestPasses(req.guestPasses());
        if (req.discountPct() != null) cfg.setDiscountPct(req.discountPct());
        cfg.setIsActive(req.isActive());
        return toDto(repo.save(cfg));
    }

    @Transactional
    public void reorder(UUID gymId, List<String> planOrder) {
        for (int i = 0; i < planOrder.size(); i++) {
            String planName = planOrder.get(i).toUpperCase();
            repo.findByGymIdAndPlanName(gymId, planName).ifPresent(cfg -> {
                cfg.setSortOrder(planOrder.indexOf(planName));
                repo.save(cfg);
            });
        }
    }

    public Long getPriceLkr(UUID gymId, String planName) {
        return repo.findByGymIdAndPlanName(gymId, planName.toUpperCase())
            .map(MembershipPlanConfig::getPriceLkr)
            .orElse(0L);
    }

    public List<String> getFeatures(UUID gymId, String planName) {
        return repo.findByGymIdAndPlanName(gymId, planName.toUpperCase())
            .map(cfg -> {
                JsonNode features = cfg.getFeatures();
                if (features == null || !features.isArray()) return Collections.<String>emptyList();
                List<String> list = new ArrayList<>();
                features.forEach(n -> list.add(n.asText()));
                return list;
            })
            .orElse(Collections.emptyList());
    }

    public boolean hasLocker(UUID gymId, String planName) {
        return repo.findByGymIdAndPlanName(gymId, planName.toUpperCase())
            .map(cfg -> Boolean.TRUE.equals(cfg.getLockerIncluded()))
            .orElse(false);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    MembershipPlanConfigDTO toDto(MembershipPlanConfig cfg) {
        List<String> features = new ArrayList<>();
        if (cfg.getFeatures() != null && cfg.getFeatures().isArray()) {
            cfg.getFeatures().forEach(n -> features.add(n.asText()));
        }
        long priceLkr = cfg.getPriceLkr() != null ? cfg.getPriceLkr() : 0L;
        String priceFormatted = "Rs. " + String.format("%,.0f", priceLkr / 100.0);
        int days = cfg.getDurationDays() != null ? cfg.getDurationDays() : 30;
        String durationLabel = days == 30 ? "1 Month" : days == 365 ? "1 Year" : days + " Days";

        return new MembershipPlanConfigDTO(
            cfg.getId(), cfg.getGymId(),
            cfg.getPlanName(), cfg.getDisplayName(),
            priceLkr, priceFormatted, days, durationLabel,
            cfg.getColor(), cfg.getDescription(), features,
            cfg.getMaxClassesPerWeek(), cfg.getMaxPtSessions(),
            cfg.getLockerIncluded(), cfg.getGuestPasses(),
            cfg.getDiscountPct() != null ? cfg.getDiscountPct() : BigDecimal.ZERO,
            cfg.getIsActive(), cfg.getSortOrder()
        );
    }
}
