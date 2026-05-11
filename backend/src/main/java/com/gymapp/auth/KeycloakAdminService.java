package com.gymapp.auth;

import com.gymapp.config.KeycloakAdminProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class KeycloakAdminService {

    private final KeycloakAdminProperties props;
    private final RestTemplate restTemplate;

    private String cachedToken;
    private long tokenExpiry = 0;

    public KeycloakAdminService(KeycloakAdminProperties props) {
        this.props = props;
        this.restTemplate = new RestTemplate();
    }

    private String adminBase() {
        return props.getServerUrl() + "/admin/realms/" + props.getRealm();
    }

    private synchronized String getAdminToken() {
        if (cachedToken != null && System.currentTimeMillis() < tokenExpiry - 10_000) {
            return cachedToken;
        }
        String tokenUrl = props.getServerUrl() + "/realms/" + props.getRealm() + "/protocol/openid-connect/token";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", props.getClientId());
        form.add("client_secret", props.getClientSecret());
        ResponseEntity<Map> resp = restTemplate.postForEntity(tokenUrl, new HttpEntity<>(form, headers), Map.class);
        Map<?, ?> body = resp.getBody();
        cachedToken = (String) body.get("access_token");
        int expiresIn = (Integer) body.get("expires_in");
        tokenExpiry = System.currentTimeMillis() + expiresIn * 1000L;
        return cachedToken;
    }

    private HttpHeaders authHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(getAdminToken());
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    public String createGymOwner(String email, String password, String ownerName, UUID gymId) {
        try {
            String[] nameParts = ownerName.trim().split(" ", 2);
            Map<String, Object> user = new LinkedHashMap<>();
            user.put("username", email);
            user.put("email", email);
            user.put("firstName", nameParts[0]);
            user.put("lastName", nameParts.length > 1 ? nameParts[1] : "");
            user.put("enabled", true);
            user.put("emailVerified", true);
            user.put("attributes", Map.of("gym_id", List.of(gymId.toString())));
            user.put("credentials", List.of(Map.of(
                "type", "password", "value", password, "temporary", false)));

            ResponseEntity<Void> createResp = restTemplate.postForEntity(
                adminBase() + "/users",
                new HttpEntity<>(user, authHeaders()), Void.class);

            if (createResp.getStatusCode() != HttpStatus.CREATED) {
                throw new IllegalStateException("Failed to create Keycloak user: " + createResp.getStatusCode());
            }

            String location = createResp.getHeaders().getFirst("Location");
            String keycloakUserId = location.substring(location.lastIndexOf("/") + 1);

            assignRole(keycloakUserId, "GYM_OWNER");
            log.info("Created Keycloak user {} with GYM_OWNER role for gym {}", keycloakUserId, gymId);
            return keycloakUserId;

        } catch (HttpClientErrorException e) {
            log.error("Keycloak user creation failed: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("Failed to create user in Keycloak: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Keycloak user creation failed: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to create user in Keycloak: " + e.getMessage());
        }
    }

    public void assignRole(String keycloakUserId, String roleName) {
        try {
            ResponseEntity<List> rolesResp = restTemplate.exchange(
                adminBase() + "/roles/" + roleName,
                HttpMethod.GET, new HttpEntity<>(authHeaders()), List.class);

            ResponseEntity<Map> roleResp = restTemplate.exchange(
                adminBase() + "/roles/" + roleName,
                HttpMethod.GET, new HttpEntity<>(authHeaders()), Map.class);

            restTemplate.postForEntity(
                adminBase() + "/users/" + keycloakUserId + "/role-mappings/realm",
                new HttpEntity<>(List.of(roleResp.getBody()), authHeaders()), Void.class);

            log.info("Assigned role {} to user {}", roleName, keycloakUserId);
        } catch (HttpClientErrorException e) {
            log.error("Role assignment failed: {} {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("Failed to assign role: " + e.getResponseBodyAsString());
        }
    }

    public void deleteUser(String keycloakUserId) {
        try {
            restTemplate.exchange(
                adminBase() + "/users/" + keycloakUserId,
                HttpMethod.DELETE, new HttpEntity<>(authHeaders()), Void.class);
            log.info("Deleted Keycloak user {}", keycloakUserId);
        } catch (HttpClientErrorException e) {
            log.warn("Delete user failed (may not exist): {}", e.getResponseBodyAsString());
        }
    }

    public Optional<String> findUserIdByEmail(String email) {
        try {
            ResponseEntity<List> resp = restTemplate.exchange(
                adminBase() + "/users?email=" + email + "&exact=true",
                HttpMethod.GET, new HttpEntity<>(authHeaders()), List.class);
            List<?> users = resp.getBody();
            if (users != null && !users.isEmpty()) {
                Map<?, ?> user = (Map<?, ?>) users.get(0);
                return Optional.ofNullable((String) user.get("id"));
            }
            return Optional.empty();
        } catch (Exception e) {
            log.warn("Failed to find Keycloak user by email {}: {}", email, e.getMessage());
            return Optional.empty();
        }
    }

    public void updateUserGymId(String keycloakUserId, UUID gymId) {
        try {
            ResponseEntity<Map> userResp = restTemplate.exchange(
                adminBase() + "/users/" + keycloakUserId,
                HttpMethod.GET, new HttpEntity<>(authHeaders()), Map.class);
            Map<String, Object> user = new LinkedHashMap<>(userResp.getBody());
            user.put("attributes", Map.of("gym_id", List.of(gymId.toString())));
            restTemplate.exchange(
                adminBase() + "/users/" + keycloakUserId,
                HttpMethod.PUT, new HttpEntity<>(user, authHeaders()), Void.class);
        } catch (HttpClientErrorException e) {
            log.error("Update user gymId failed: {}", e.getResponseBodyAsString());
        }
    }
}
