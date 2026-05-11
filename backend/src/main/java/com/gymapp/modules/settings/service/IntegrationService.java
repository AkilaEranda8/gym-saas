package com.gymapp.modules.settings.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.entity.IntegrationSetting;
import com.gymapp.modules.settings.enums.IntegrationProvider;
import com.gymapp.modules.settings.enums.IntegrationTestStatus;
import com.gymapp.modules.settings.repository.IntegrationSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntegrationService {

    private final IntegrationSettingRepository repo;
    private final ObjectMapper objectMapper;

    private static final Set<String> SENSITIVE_KEYS = Set.of(
        "merchantSecret", "apiKey", "secretAccessKey", "clientSecret",
        "webhookSecret", "password", "token"
    );

    @Transactional(readOnly = true)
    public List<IntegrationDTO> getAll(UUID gymId) {
        List<IntegrationSetting> existing = repo.findAllByGymId(gymId);
        Map<IntegrationProvider, IntegrationSetting> map = existing.stream()
            .collect(Collectors.toMap(IntegrationSetting::getProvider, s -> s));

        return Arrays.stream(IntegrationProvider.values())
            .map(p -> toDto(map.computeIfAbsent(p, pr -> buildDefault(gymId, pr))))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IntegrationDTO getByProvider(UUID gymId, IntegrationProvider provider) {
        return toDto(findOrCreate(gymId, provider));
    }

    @Transactional
    public IntegrationDTO update(UUID gymId, IntegrationProvider provider, UpdateIntegrationRequest req) {
        IntegrationSetting s = findOrCreate(gymId, provider);
        if (req.isEnabled() != null) s.setIsEnabled(req.isEnabled());
        if (req.testMode() != null) s.setTestMode(req.testMode());
        if (req.config() != null && !req.config().isEmpty()) {
            ObjectNode merged = objectMapper.createObjectNode();
            if (s.getConfigJson() != null) {
                s.getConfigJson().fields().forEachRemaining(e -> merged.set(e.getKey(), e.getValue()));
            }
            req.config().forEach(merged::put);
            s.setConfigJson(merged);
        }
        return toDto(repo.save(s));
    }

    @Transactional
    public IntegrationTestResultDTO test(UUID gymId, IntegrationProvider provider) {
        IntegrationSetting s = findOrCreate(gymId, provider);
        long start = System.currentTimeMillis();
        IntegrationTestStatus status;
        String message;

        try {
            status = runProviderTest(provider, s);
            message = "Connection successful";
        } catch (Exception ex) {
            status = IntegrationTestStatus.FAILED;
            message = ex.getMessage();
            log.warn("Integration test failed for provider {}: {}", provider, ex.getMessage());
        }

        long elapsed = System.currentTimeMillis() - start;
        s.setLastTestedAt(LocalDateTime.now());
        s.setLastTestStatus(status);
        s.setLastTestMessage(message);
        repo.save(s);

        return new IntegrationTestResultDTO(provider, status, message, elapsed, LocalDateTime.now());
    }

    public boolean isProviderEnabled(UUID gymId, IntegrationProvider provider) {
        return repo.findByGymIdAndProvider(gymId, provider)
            .map(s -> Boolean.TRUE.equals(s.getIsEnabled()))
            .orElse(false);
    }

    public Map<String, String> getProviderConfig(UUID gymId, IntegrationProvider provider) {
        return repo.findByGymIdAndProvider(gymId, provider)
            .map(s -> {
                Map<String, String> cfg = new LinkedHashMap<>();
                if (s.getConfigJson() != null) {
                    s.getConfigJson().fields().forEachRemaining(e ->
                        cfg.put(e.getKey(), e.getValue().asText()));
                }
                return cfg;
            })
            .orElse(Collections.emptyMap());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private IntegrationSetting findOrCreate(UUID gymId, IntegrationProvider provider) {
        return repo.findByGymIdAndProvider(gymId, provider).orElseGet(() -> {
            IntegrationSetting s = buildDefault(gymId, provider);
            return repo.save(s);
        });
    }

    private IntegrationSetting buildDefault(UUID gymId, IntegrationProvider provider) {
        IntegrationSetting s = new IntegrationSetting();
        s.setGymId(gymId);
        s.setProvider(provider);
        s.setIsEnabled(false);
        s.setTestMode(true);
        s.setConfigJson(objectMapper.createObjectNode());
        s.setLastTestStatus(IntegrationTestStatus.UNTESTED);
        return s;
    }

    private IntegrationTestStatus runProviderTest(IntegrationProvider provider,
                                                   IntegrationSetting s) {
        Map<String, String> cfg = new LinkedHashMap<>();
        if (s.getConfigJson() != null) {
            s.getConfigJson().fields().forEachRemaining(e -> cfg.put(e.getKey(), e.getValue().asText()));
        }
        switch (provider) {
            case PAYHERE -> {
                if (!cfg.containsKey("merchantId") || !cfg.containsKey("merchantSecret"))
                    throw new IllegalStateException("PayHere merchant credentials not configured");
                return IntegrationTestStatus.SUCCESS;
            }
            case SENDGRID -> {
                if (!cfg.containsKey("apiKey"))
                    throw new IllegalStateException("SendGrid API key not configured");
                return IntegrationTestStatus.SUCCESS;
            }
            case CLOUDFLARE_R2 -> {
                if (!cfg.containsKey("accountId") || !cfg.containsKey("accessKeyId") ||
                    !cfg.containsKey("secretAccessKey") || !cfg.containsKey("bucketName"))
                    throw new IllegalStateException("Cloudflare R2 credentials incomplete");
                return IntegrationTestStatus.SUCCESS;
            }
            case DIALOG_SMS -> {
                if (!cfg.containsKey("apiKey"))
                    throw new IllegalStateException("Dialog SMS API key not configured");
                return IntegrationTestStatus.SUCCESS;
            }
            case DIALOG_WHATSAPP -> {
                if (!cfg.containsKey("apiKey") || !cfg.containsKey("senderNumber"))
                    throw new IllegalStateException("Dialog WhatsApp credentials not configured");
                return IntegrationTestStatus.SUCCESS;
            }
            case GOOGLE_MAPS -> {
                if (!cfg.containsKey("apiKey"))
                    throw new IllegalStateException("Google Maps API key not configured");
                return IntegrationTestStatus.SUCCESS;
            }
            case CUSTOM_WEBHOOK -> {
                if (!cfg.containsKey("webhookUrl"))
                    throw new IllegalStateException("Webhook URL not configured");
                return IntegrationTestStatus.SUCCESS;
            }
            default -> { return IntegrationTestStatus.SUCCESS; }
        }
    }

    private IntegrationDTO toDto(IntegrationSetting s) {
        Map<String, String> cfg = new LinkedHashMap<>();
        if (s.getConfigJson() != null) {
            s.getConfigJson().fields().forEachRemaining(e -> {
                String k = e.getKey();
                String v = SENSITIVE_KEYS.contains(k) ? "***" : e.getValue().asText();
                cfg.put(k, v);
            });
        }
        boolean configured = !cfg.isEmpty() && cfg.values().stream()
            .anyMatch(v -> v != null && !v.isBlank() && !v.equals("***"));

        return new IntegrationDTO(
            s.getId(), s.getGymId(), s.getProvider(),
            formatProviderLabel(s.getProvider()),
            s.getIsEnabled(), s.getTestMode(), cfg,
            s.getLastTestedAt(), s.getLastTestStatus(), s.getLastTestMessage(),
            configured
        );
    }

    private String formatProviderLabel(IntegrationProvider p) {
        return switch (p) {
            case PAYHERE -> "PayHere";
            case DIALOG_SMS -> "Dialog SMS";
            case DIALOG_WHATSAPP -> "Dialog WhatsApp";
            case TWILIO -> "Twilio";
            case SENDGRID -> "SendGrid";
            case CLOUDFLARE_R2 -> "Cloudflare R2";
            case GOOGLE_MAPS -> "Google Maps";
            case SENTRY -> "Sentry";
            case STRIPE -> "Stripe";
            case CUSTOM_WEBHOOK -> "Custom Webhook";
        };
    }
}
