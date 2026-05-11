package com.gymapp.shared;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class CurrentUser {

    public String getUserId() {
        return principal().getName();
    }

    public UUID getGymId() {
        String raw = getAttribute("gym_id");
        return raw != null ? UUID.fromString(raw) : null;
    }

    public String getEmail() {
        return getAttribute("email");
    }

    public List<String> getRoles() {
        Map<String, Object> realmAccess = getAttribute("realm_access");
        if (realmAccess == null) return List.of();
        Object roles = realmAccess.get("roles");
        if (roles instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    public boolean hasRole(String role) {
        return getRoles().contains(role);
    }

    public boolean isGymOwner() {
        return hasRole("GYM_OWNER");
    }

    public boolean isManager() {
        return hasRole("MANAGER");
    }

    public boolean isTrainer() {
        return hasRole("TRAINER");
    }

    public boolean isMember() {
        return hasRole("MEMBER");
    }

    public boolean isSuperAdmin() {
        return hasRole("SUPER_ADMIN");
    }

    private BearerTokenAuthentication principal() {
        return (BearerTokenAuthentication) SecurityContextHolder
            .getContext().getAuthentication();
    }

    @SuppressWarnings("unchecked")
    private <T> T getAttribute(String key) {
        Object value = principal().getTokenAttributes().get(key);
        return value != null ? (T) value : null;
    }
}
