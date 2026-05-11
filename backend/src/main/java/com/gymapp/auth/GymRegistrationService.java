package com.gymapp.auth;

import com.gymapp.auth.dto.GymRegistrationRequest;
import com.gymapp.auth.dto.GymRegistrationResponse;
import com.gymapp.modules.gym.Gym;
import com.gymapp.modules.gym.GymRepository;
import com.gymapp.shared.enums.SubscriptionStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class GymRegistrationService {

    private final GymRepository gymRepository;
    private final KeycloakAdminService keycloakAdminService;

    private static final Pattern NON_LATIN    = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE   = Pattern.compile("[\\s]+");
    private static final Pattern MULTI_HYPHEN = Pattern.compile("-+");

    @Transactional
    public GymRegistrationResponse register(GymRegistrationRequest request) {
        if (gymRepository.existsByOwnerEmail(request.email())) {
            throw new IllegalStateException("An account with this email already exists");
        }

        String slug      = generateSlug(request.gymName());
        String subdomain = ensureUniqueSubdomain(slug);

        // 1. Persist the gym first (to get the gym UUID)
        Gym gym = new Gym();
        gym.setName(request.gymName());
        gym.setSlug(subdomain);
        gym.setSubdomain(subdomain);
        gym.setOwnerEmail(request.email());
        gym.setOwnerName(request.ownerName());
        gym.setPhone(request.phone());
        gym.setAddress(request.address());
        gym.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        gym = gymRepository.save(gym);

        // 2. Create Keycloak user with gym_id attribute
        String keycloakUserId = null;
        String message = "Registration successful. You can now log in.";
        try {
            keycloakUserId = keycloakAdminService.createGymOwner(
                request.email(),
                request.password(),
                request.ownerName(),
                gym.getId()
            );
        } catch (Exception e) {
            log.warn("Keycloak user creation failed, checking if user already exists: {}", e.getMessage());
            keycloakUserId = keycloakAdminService.findUserIdByEmail(request.email()).orElse(null);
            if (keycloakUserId != null) {
                keycloakAdminService.updateUserGymId(keycloakUserId, gym.getId());
                log.info("Reused existing Keycloak user {} for gym {}", keycloakUserId, gym.getId());
            } else {
                message = "Gym registered. Please ask your admin to set up your Keycloak account.";
            }
        }

        // 3. Store Keycloak user ID on gym record (may be null if Keycloak failed)
        if (keycloakUserId != null) {
            gym.setOwnerUserId(keycloakUserId);
            gymRepository.save(gym);
        }

        log.info("Gym registered — id={}, slug={}, owner={}", gym.getId(), subdomain, request.email());

        return new GymRegistrationResponse(
            gym.getId(),
            gym.getName(),
            gym.getSlug(),
            gym.getSubdomain(),
            request.email(),
            message
        );
    }

    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD);
        String slug = NON_LATIN.matcher(
                WHITESPACE.matcher(normalized.toLowerCase(Locale.ENGLISH)).replaceAll("-")
            ).replaceAll("");
        return MULTI_HYPHEN.matcher(slug).replaceAll("-").replaceAll("^-|-$", "");
    }

    private String ensureUniqueSubdomain(String base) {
        String candidate = base;
        int suffix = 1;
        while (gymRepository.existsBySubdomain(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }
}
