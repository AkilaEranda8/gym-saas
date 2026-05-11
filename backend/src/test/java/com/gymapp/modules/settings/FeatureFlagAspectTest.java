package com.gymapp.modules.settings;

import com.gymapp.modules.settings.annotation.RequireFeature;
import com.gymapp.modules.settings.aspect.FeatureFlagAspect;
import com.gymapp.modules.settings.enums.FeatureKey;
import com.gymapp.modules.settings.exception.FeatureDisabledException;
import com.gymapp.modules.settings.service.FeatureFlagService;
import com.gymapp.multitenancy.TenantContext;
import org.aspectj.lang.ProceedingJoinPoint;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class FeatureFlagAspectTest {

    @Mock FeatureFlagService   featureFlagService;
    @Mock ProceedingJoinPoint  joinPoint;
    @Mock RequireFeature       requireFeature;

    @InjectMocks FeatureFlagAspect aspect;

    static final UUID GYM_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        TenantContext.setGymId(GYM_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void checkFeature_WhenFeatureEnabled_ShouldProceed() throws Throwable {
        given(requireFeature.value()).willReturn("CLASS_BOOKING");
        given(featureFlagService.isEnabled(GYM_ID, FeatureKey.CLASS_BOOKING)).willReturn(true);
        given(joinPoint.proceed()).willReturn("result");

        Object result = aspect.checkFeature(joinPoint, requireFeature);

        assertThat(result).isEqualTo("result");
        verify(joinPoint).proceed();
    }

    @Test
    void checkFeature_WhenFeatureDisabled_ShouldThrowFeatureDisabledException() throws Throwable {
        given(requireFeature.value()).willReturn("SHOP_POS");
        given(featureFlagService.isEnabled(GYM_ID, FeatureKey.SHOP_POS)).willReturn(false);

        assertThatThrownBy(() -> aspect.checkFeature(joinPoint, requireFeature))
            .isInstanceOf(FeatureDisabledException.class)
            .hasMessageContaining("Shop & POS");

        verify(joinPoint, never()).proceed();
    }

    @Test
    void checkFeature_WhenGymIdNotInContext_ShouldProceedWithoutCheck() throws Throwable {
        TenantContext.clear();
        given(requireFeature.value()).willReturn("CLASS_BOOKING");
        given(joinPoint.proceed()).willReturn("result");

        Object result = aspect.checkFeature(joinPoint, requireFeature);

        assertThat(result).isEqualTo("result");
        verify(featureFlagService, never()).isEnabled(any(), any());
    }

    @Test
    void checkFeature_WhenUnknownFeatureKey_ShouldProceed() throws Throwable {
        given(requireFeature.value()).willReturn("NONEXISTENT_FEATURE_KEY_XYZ");
        given(joinPoint.proceed()).willReturn("result");

        Object result = aspect.checkFeature(joinPoint, requireFeature);

        assertThat(result).isEqualTo("result");
        verify(featureFlagService, never()).isEnabled(any(), any());
    }

    @Test
    void checkFeature_WhenFeatureIsMultiBranchAndEnabled_ShouldProceed() throws Throwable {
        given(requireFeature.value()).willReturn("MULTI_BRANCH");
        given(featureFlagService.isEnabled(GYM_ID, FeatureKey.MULTI_BRANCH)).willReturn(true);
        given(joinPoint.proceed()).willReturn(null);

        Object result = aspect.checkFeature(joinPoint, requireFeature);

        assertThat(result).isNull();
        verify(joinPoint).proceed();
    }

    @Test
    void checkFeature_WhenJoinPointThrows_ShouldPropagateException() throws Throwable {
        given(requireFeature.value()).willReturn("QR_CHECKIN");
        given(featureFlagService.isEnabled(GYM_ID, FeatureKey.QR_CHECKIN)).willReturn(true);
        given(joinPoint.proceed()).willThrow(new RuntimeException("Service error"));

        assertThatThrownBy(() -> aspect.checkFeature(joinPoint, requireFeature))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("Service error");
    }
}
