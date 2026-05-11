package com.gymapp.modules.settings;

import com.gymapp.modules.gym.Gym;
import com.gymapp.modules.gym.GymRepository;
import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.entity.FeatureFlag;
import com.gymapp.modules.settings.enums.FeatureKey;
import com.gymapp.modules.settings.repository.FeatureFlagRepository;
import com.gymapp.modules.settings.service.FeatureFlagService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class FeatureFlagServiceTest {

    @Mock FeatureFlagRepository       repo;
    @Mock GymRepository               gymRepository;
    @Mock RedisTemplate<String, Object> redis;
    @Mock ValueOperations<String, Object> valueOps;

    @InjectMocks FeatureFlagService featureFlagService;

    static final UUID GYM_ID = UUID.randomUUID();

    // ── isEnabled ─────────────────────────────────────────────────

    @Test
    void isEnabled_WhenCacheHit_ShouldReturnCachedValue() {
        String cacheKey = "feature:" + GYM_ID + ":" + FeatureKey.CLASS_BOOKING.name();
        given(redis.opsForValue()).willReturn(valueOps);
        given(valueOps.get(cacheKey)).willReturn(Boolean.TRUE);

        boolean result = featureFlagService.isEnabled(GYM_ID, FeatureKey.CLASS_BOOKING);

        assertThat(result).isTrue();
        verify(repo, never()).findByGymIdAndFeatureKey(any(), any());
    }

    @Test
    void isEnabled_WhenCacheMissAndFlagEnabled_ShouldQueryDbAndCache() {
        String cacheKey = "feature:" + GYM_ID + ":" + FeatureKey.SHOP_POS.name();
        FeatureFlag flag = buildFlag(FeatureKey.SHOP_POS, true);

        given(redis.opsForValue()).willReturn(valueOps);
        given(valueOps.get(cacheKey)).willReturn(null);
        given(repo.findByGymIdAndFeatureKey(GYM_ID, FeatureKey.SHOP_POS)).willReturn(Optional.of(flag));
        doNothing().when(valueOps).set(anyString(), any(), any(Duration.class));

        boolean result = featureFlagService.isEnabled(GYM_ID, FeatureKey.SHOP_POS);

        assertThat(result).isTrue();
        verify(valueOps).set(eq(cacheKey), eq(true), any(Duration.class));
    }

    @Test
    void isEnabled_WhenCacheMissAndFlagDisabled_ShouldReturnFalse() {
        String cacheKey = "feature:" + GYM_ID + ":" + FeatureKey.MULTI_BRANCH.name();
        FeatureFlag flag = buildFlag(FeatureKey.MULTI_BRANCH, false);

        given(redis.opsForValue()).willReturn(valueOps);
        given(valueOps.get(cacheKey)).willReturn(null);
        given(repo.findByGymIdAndFeatureKey(GYM_ID, FeatureKey.MULTI_BRANCH)).willReturn(Optional.of(flag));
        doNothing().when(valueOps).set(anyString(), any(), any(Duration.class));

        boolean result = featureFlagService.isEnabled(GYM_ID, FeatureKey.MULTI_BRANCH);

        assertThat(result).isFalse();
    }

    @Test
    void isEnabled_WhenFlagNotInDb_ShouldDefaultToTrue() {
        String cacheKey = "feature:" + GYM_ID + ":" + FeatureKey.QR_CHECKIN.name();

        given(redis.opsForValue()).willReturn(valueOps);
        given(valueOps.get(cacheKey)).willReturn(null);
        given(repo.findByGymIdAndFeatureKey(GYM_ID, FeatureKey.QR_CHECKIN)).willReturn(Optional.empty());
        doNothing().when(valueOps).set(anyString(), any(), any(Duration.class));

        boolean result = featureFlagService.isEnabled(GYM_ID, FeatureKey.QR_CHECKIN);

        assertThat(result).isTrue();
    }

    // ── getAllFeatures ────────────────────────────────────────────

    @Test
    void getAllFeatures_ShouldReturnAllFeatureKeysWithPlanInfo() {
        Gym gym = new Gym();
        gym.setSubscriptionPlan("STARTER");

        given(gymRepository.findById(GYM_ID)).willReturn(Optional.of(gym));
        given(repo.findAllByGymId(GYM_ID)).willReturn(List.of());

        AllFeaturesDTO result = featureFlagService.getAllFeatures(GYM_ID);

        assertThat(result).isNotNull();
        assertThat(result.features()).hasSize(FeatureKey.values().length);
        assertThat(result.currentPlan()).isEqualTo("STARTER");
    }

    @Test
    void getAllFeatures_StarterPlan_ShouldNotAllowProFeatures() {
        Gym gym = new Gym();
        gym.setSubscriptionPlan("STARTER");

        given(gymRepository.findById(GYM_ID)).willReturn(Optional.of(gym));
        given(repo.findAllByGymId(GYM_ID)).willReturn(List.of());

        AllFeaturesDTO result = featureFlagService.getAllFeatures(GYM_ID);

        FeatureFlagDTO multibranchFlag = result.features().stream()
            .filter(f -> f.featureKey() == FeatureKey.MULTI_BRANCH)
            .findFirst().orElseThrow();

        assertThat(multibranchFlag.isAvailableOnCurrentPlan()).isFalse();
    }

    @Test
    void getAllFeatures_EnterprisePlan_ShouldAllowAllFeatures() {
        Gym gym = new Gym();
        gym.setSubscriptionPlan("ENTERPRISE");

        given(gymRepository.findById(GYM_ID)).willReturn(Optional.of(gym));
        given(repo.findAllByGymId(GYM_ID)).willReturn(List.of());

        AllFeaturesDTO result = featureFlagService.getAllFeatures(GYM_ID);

        result.features().forEach(flag -> assertThat(flag.isAvailableOnCurrentPlan()).isTrue());
    }

    // ── updateFlags ───────────────────────────────────────────────

    @Test
    void updateFlags_WhenDisablingFeature_ShouldPersistAndEvictCache() {
        FeatureFlag existing = buildFlag(FeatureKey.CLASS_BOOKING, true);
        Gym gym = new Gym();
        gym.setSubscriptionPlan("STARTER");

        Map<String, Boolean> updates = Map.of("CLASS_BOOKING", false);
        UpdateFeatureFlagsRequest req = new UpdateFeatureFlagsRequest(updates);

        given(repo.findByGymIdAndFeatureKey(GYM_ID, FeatureKey.CLASS_BOOKING)).willReturn(Optional.of(existing));
        given(repo.save(any())).willReturn(existing);
        given(redis.delete(anyString())).willReturn(true);
        given(gymRepository.findById(GYM_ID)).willReturn(Optional.of(gym));
        given(repo.findAllByGymId(GYM_ID)).willReturn(List.of(existing));
        given(redis.opsForValue()).willReturn(valueOps);

        featureFlagService.updateFlags(GYM_ID, req);

        assertThat(existing.getIsEnabled()).isFalse();
        verify(redis).delete("feature:" + GYM_ID + ":CLASS_BOOKING");
        verify(repo).save(existing);
    }

    @Test
    void updateFlags_WhenEnablingProFeatureOnStarterPlan_ShouldSkipUpdate() {
        Gym gym = new Gym();
        gym.setSubscriptionPlan("STARTER");

        Map<String, Boolean> updates = Map.of("MULTI_BRANCH", true);
        UpdateFeatureFlagsRequest req = new UpdateFeatureFlagsRequest(updates);

        given(gymRepository.findById(GYM_ID)).willReturn(Optional.of(gym));
        given(repo.findAllByGymId(GYM_ID)).willReturn(List.of());
        given(redis.opsForValue()).willReturn(valueOps);

        featureFlagService.updateFlags(GYM_ID, req);

        verify(repo, never()).save(any());
    }

    // ── checkFeature ──────────────────────────────────────────────

    @Test
    void checkFeature_WhenValidKey_ShouldDelegateToIsEnabled() {
        given(redis.opsForValue()).willReturn(valueOps);
        given(valueOps.get(anyString())).willReturn(Boolean.TRUE);

        boolean result = featureFlagService.checkFeature(GYM_ID, "CLASS_BOOKING");

        assertThat(result).isTrue();
    }

    @Test
    void checkFeature_WhenInvalidKey_ShouldReturnTrue() {
        boolean result = featureFlagService.checkFeature(GYM_ID, "NONEXISTENT_FEATURE");

        assertThat(result).isTrue();
        verify(repo, never()).findByGymIdAndFeatureKey(any(), any());
    }

    // ── Helpers ───────────────────────────────────────────────────

    private FeatureFlag buildFlag(FeatureKey key, boolean enabled) {
        FeatureFlag f = new FeatureFlag();
        f.setId(UUID.randomUUID());
        f.setGymId(GYM_ID);
        f.setFeatureKey(key);
        f.setIsEnabled(enabled);
        f.setEnabledByPlan(false);
        f.setOverrideByAdmin(false);
        return f;
    }
}
