package com.gymapp.modules.settings.service;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.entity.FeatureFlag;
import com.gymapp.modules.settings.enums.FeatureKey;
import com.gymapp.modules.settings.repository.FeatureFlagRepository;
import com.gymapp.modules.gym.GymRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeatureFlagService {

    private final FeatureFlagRepository repo;
    private final GymRepository gymRepository;
    private final RedisTemplate<String, Object> redis;

    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final String CACHE_PREFIX = "feature:";

    @Transactional(readOnly = true)
    public AllFeaturesDTO getAllFeatures(UUID gymId) {
        String currentPlan = gymRepository.findById(gymId)
            .map(g -> g.getSubscriptionPlan() != null ? g.getSubscriptionPlan() : "STARTER")
            .orElse("STARTER");

        Map<FeatureKey, FeatureFlag> existing = repo.findAllByGymId(gymId).stream()
            .collect(Collectors.toMap(FeatureFlag::getFeatureKey, f -> f));

        List<FeatureFlagDTO> flags = Arrays.stream(FeatureKey.values())
            .map(key -> {
                FeatureFlag flag = existing.getOrDefault(key, defaultFlag(gymId, key));
                boolean available = isPlanSufficient(currentPlan, key.getRequiredPlan());
                return new FeatureFlagDTO(
                    key, key.getLabel(), key.getDescription(),
                    flag.getIsEnabled(), flag.getEnabledByPlan(),
                    key.getRequiredPlan(), available, flag.getOverrideByAdmin()
                );
            })
            .collect(Collectors.toList());

        long enabled = flags.stream().filter(f -> Boolean.TRUE.equals(f.isEnabled())).count();
        return new AllFeaturesDTO(currentPlan, flags, enabled, flags.size() - enabled);
    }

    @Transactional(readOnly = true)
    public boolean isEnabled(UUID gymId, FeatureKey featureKey) {
        String cacheKey = CACHE_PREFIX + gymId + ":" + featureKey.name();
        Object cached = redis.opsForValue().get(cacheKey);
        if (cached instanceof Boolean b) return b;

        boolean result = repo.findByGymIdAndFeatureKey(gymId, featureKey)
            .map(f -> Boolean.TRUE.equals(f.getIsEnabled()))
            .orElse(true);

        redis.opsForValue().set(cacheKey, result, CACHE_TTL);
        return result;
    }

    @Transactional
    public AllFeaturesDTO updateFlags(UUID gymId, UpdateFeatureFlagsRequest req) {
        String currentPlan = gymRepository.findById(gymId)
            .map(g -> g.getSubscriptionPlan() != null ? g.getSubscriptionPlan() : "STARTER")
            .orElse("STARTER");

        req.flags().forEach((keyStr, enabled) -> {
            FeatureKey key;
            try { key = FeatureKey.valueOf(keyStr); }
            catch (IllegalArgumentException e) { return; }

            if (Boolean.TRUE.equals(enabled) && !isPlanSufficient(currentPlan, key.getRequiredPlan())) {
                return;
            }

            FeatureFlag flag = repo.findByGymIdAndFeatureKey(gymId, key)
                .orElseGet(() -> defaultFlag(gymId, key));
            flag.setIsEnabled(enabled);
            repo.save(flag);
            redis.delete(CACHE_PREFIX + gymId + ":" + key.name());
        });
        return getAllFeatures(gymId);
    }

    public boolean checkFeature(UUID gymId, String featureKeyStr) {
        try {
            return isEnabled(gymId, FeatureKey.valueOf(featureKeyStr));
        } catch (IllegalArgumentException e) {
            return true;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private FeatureFlag defaultFlag(UUID gymId, FeatureKey key) {
        FeatureFlag f = new FeatureFlag();
        f.setGymId(gymId);
        f.setFeatureKey(key);
        f.setIsEnabled(true);
        f.setEnabledByPlan(false);
        f.setOverrideByAdmin(false);
        return f;
    }

    private boolean isPlanSufficient(String currentPlan, String requiredPlan) {
        List<String> order = List.of("STARTER", "PRO", "ENTERPRISE");
        int current = order.indexOf(currentPlan.toUpperCase());
        int required = order.indexOf(requiredPlan.toUpperCase());
        if (current < 0) current = 0;
        if (required < 0) required = 0;
        return current >= required;
    }
}
