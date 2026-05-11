package com.gymapp.multitenancy;

import com.gymapp.modules.gym.GymRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class TenantFilter extends OncePerRequestFilter {

    private final GymRepository gymRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth instanceof BearerTokenAuthentication bta) {
                String gymId = (String) bta.getTokenAttributes().get("gym_id");
                if (gymId != null && !gymId.isBlank()) {
                    TenantContext.setGymId(gymId);
                    log.debug("TenantContext set — gym_id={}", gymId);
                } else {
                    String sub = (String) bta.getTokenAttributes().get("sub");
                    if (sub != null) {
                        gymRepository.findByOwnerUserId(sub).ifPresent(gym -> {
                            TenantContext.setGymId(gym.getId());
                            log.debug("TenantContext set via DB lookup — gym_id={}", gym.getId());
                        });
                    }
                    if (TenantContext.getGymId() == null) {
                        log.warn("Bearer token has no gym_id claim for request: {}", request.getRequestURI());
                    }
                }

                String branchId = request.getHeader("X-Branch-ID");
                if (branchId != null && !branchId.isBlank()) {
                    TenantContext.setBranchId(branchId);
                }
            }

            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/api/v1/auth/register-gym")
            || path.equals("/api/v1/billing/payhere/notify")
            || path.startsWith("/actuator/");
    }
}
