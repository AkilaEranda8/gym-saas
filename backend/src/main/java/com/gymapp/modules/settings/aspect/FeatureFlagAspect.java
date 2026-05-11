package com.gymapp.modules.settings.aspect;

import com.gymapp.modules.settings.annotation.RequireFeature;
import com.gymapp.modules.settings.enums.FeatureKey;
import com.gymapp.modules.settings.exception.FeatureDisabledException;
import com.gymapp.modules.settings.service.FeatureFlagService;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
public class FeatureFlagAspect {

    private final FeatureFlagService featureFlagService;

    @Around("@annotation(requireFeature)")
    public Object checkFeature(ProceedingJoinPoint pjp, RequireFeature requireFeature) throws Throwable {
        UUID gymId = TenantContext.getGymId();
        if (gymId != null) {
            String featureKeyStr = requireFeature.value();
            try {
                FeatureKey key = FeatureKey.valueOf(featureKeyStr);
                if (!featureFlagService.isEnabled(gymId, key)) {
                    throw new FeatureDisabledException(key.getLabel());
                }
            } catch (IllegalArgumentException e) {
                // Unknown feature key — allow through
            }
        }
        return pjp.proceed();
    }
}
