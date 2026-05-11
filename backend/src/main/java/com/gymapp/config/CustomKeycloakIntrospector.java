package com.gymapp.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.security.oauth2.server.resource.introspection.SpringOpaqueTokenIntrospector;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
public class CustomKeycloakIntrospector implements OpaqueTokenIntrospector {

    private final SpringOpaqueTokenIntrospector delegate;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final long CACHE_TTL_SECONDS = 60L;
    private static final String CACHE_PREFIX = "introspect:";

    public CustomKeycloakIntrospector(
            String introspectionUri,
            String clientId,
            String clientSecret,
            RedisTemplate<String, Object> redisTemplate) {
        this.delegate = new SpringOpaqueTokenIntrospector(introspectionUri, clientId, clientSecret);
        this.redisTemplate = redisTemplate;
    }

    @Override
    public OAuth2AuthenticatedPrincipal introspect(String token) {
        String cacheKey = CACHE_PREFIX + DigestUtils.md5Hex(token);

        // 1. Check Redis cache
        try {
            CachedPrincipalData cached = (CachedPrincipalData) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.debug("Introspection cache hit for token hash: {}", cacheKey.substring(12, 20));
                return buildPrincipal(cached);
            }
        } catch (Exception e) {
            log.warn("Redis cache read failed, falling back to Keycloak: {}", e.getMessage());
        }

        // 2. Call Keycloak introspect endpoint
        OAuth2AuthenticatedPrincipal principal = delegate.introspect(token);

        // 3. Extract gym_id from introspection response
        String gymId = principal.getAttribute("gym_id");

        // 4. Extract roles from realm_access
        Map<String, Object> realmAccess = principal.getAttribute("realm_access");
        List<String> roles = new ArrayList<>();
        if (realmAccess != null) {
            Object rawRoles = realmAccess.get("roles");
            if (rawRoles instanceof List<?> rawList) {
                rawList.forEach(r -> roles.add(String.valueOf(r)));
            }
        }

        // 5. Build GrantedAuthorities from roles
        List<GrantedAuthority> authorities = roles.stream()
            .filter(r -> r.startsWith("GYM_")
                    || r.startsWith("SUPER_")
                    || r.equals("TRAINER")
                    || r.equals("MANAGER")
                    || r.equals("MEMBER"))
            .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
            .map(a -> (GrantedAuthority) a)
            .toList();

        // 6. Cache in Redis
        try {
            CachedPrincipalData cacheData = CachedPrincipalData.builder()
                .name(principal.getName())
                .attributes(principal.getAttributes())
                .authorities(authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList())
                .build();
            redisTemplate.opsForValue().set(cacheKey, cacheData, CACHE_TTL_SECONDS, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Redis cache write failed: {}", e.getMessage());
        }

        // 7. Return enriched principal with roles as GrantedAuthorities
        return new DefaultOAuth2AuthenticatedPrincipal(
            principal.getName(),
            principal.getAttributes(),
            authorities
        );
    }

    private OAuth2AuthenticatedPrincipal buildPrincipal(CachedPrincipalData cached) {
        List<GrantedAuthority> authorities = cached.getAuthorities().stream()
            .map(a -> (GrantedAuthority) new SimpleGrantedAuthority(a))
            .toList();
        return new DefaultOAuth2AuthenticatedPrincipal(
            cached.getName(),
            cached.getAttributes(),
            authorities
        );
    }
}
