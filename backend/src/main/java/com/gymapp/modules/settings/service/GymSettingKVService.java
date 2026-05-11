package com.gymapp.modules.settings.service;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.entity.GymSettingKV;
import com.gymapp.modules.settings.enums.SettingCategory;
import com.gymapp.modules.settings.repository.GymSettingKVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GymSettingKVService {

    private final GymSettingKVRepository repo;

    private static final String MASK = "***";

    // ── Public API ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, String> getAllSettings(UUID gymId) {
        return repo.findAllByGymId(gymId).stream()
            .collect(Collectors.toMap(
                GymSettingKV::getKey,
                kv -> Boolean.TRUE.equals(kv.getIsSensitive()) ? MASK
                      : (kv.getValue() != null ? kv.getValue() : "")
            ));
    }

    @Transactional(readOnly = true)
    public String get(UUID gymId, String key) {
        return repo.findByGymIdAndKey(gymId, key)
            .map(GymSettingKV::getValue)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public String get(UUID gymId, String key, String defaultValue) {
        String val = get(gymId, key);
        return val != null ? val : defaultValue;
    }

    @Transactional
    public void set(UUID gymId, String key, String value, String updatedBy) {
        GymSettingKV kv = repo.findByGymIdAndKey(gymId, key).orElseGet(() -> {
            GymSettingKV n = new GymSettingKV();
            n.setGymId(gymId);
            n.setKey(key);
            n.setCategory(inferCategory(key));
            return n;
        });
        kv.setValue(value);
        kv.setUpdatedBy(updatedBy);
        kv.setUpdatedAt(LocalDateTime.now());
        repo.save(kv);
    }

    @Transactional
    public void setBulk(UUID gymId, Map<String, String> values, String updatedBy) {
        values.forEach((k, v) -> set(gymId, k, v, updatedBy));
    }

    @Transactional(readOnly = true)
    public List<SettingsByCategoryDTO> getByCategories(UUID gymId) {
        List<GymSettingKV> all = repo.findAllByGymId(gymId);
        Map<SettingCategory, List<GymSettingKV>> grouped = all.stream()
            .collect(Collectors.groupingBy(GymSettingKV::getCategory));

        return Arrays.stream(SettingCategory.values())
            .filter(grouped::containsKey)
            .map(cat -> new SettingsByCategoryDTO(
                cat,
                formatLabel(cat),
                grouped.get(cat).stream()
                    .map(this::toDto)
                    .collect(Collectors.toList())
            ))
            .collect(Collectors.toList());
    }

    // ── Shortcut helpers ──────────────────────────────────────────────────────

    public boolean isWhatsAppEnabled(UUID gymId) {
        return "true".equalsIgnoreCase(get(gymId, "whatsapp.enabled", "true"));
    }

    public boolean isSmsEnabled(UUID gymId) {
        return "true".equalsIgnoreCase(get(gymId, "sms.enabled", "true"));
    }

    public boolean isEmailEnabled(UUID gymId) {
        return "true".equalsIgnoreCase(get(gymId, "email.enabled", "true"));
    }

    public String getInvoiceFooter(UUID gymId) {
        return get(gymId, "invoice.footer", "");
    }

    public String getGymPhone(UUID gymId) {
        return get(gymId, "gym.phone", "");
    }

    public String getGymName(UUID gymId) {
        return get(gymId, "gym.name", "My Gym");
    }

    public String getTimezone(UUID gymId) {
        return get(gymId, "timezone", "Asia/Colombo");
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    SettingKVDTO toDto(GymSettingKV kv) {
        String val = Boolean.TRUE.equals(kv.getIsSensitive()) && kv.getValue() != null
            ? MASK : kv.getValue();
        return new SettingKVDTO(
            kv.getKey(), val, kv.getValueType(),
            kv.getCategory(), kv.getDescription(), kv.getIsSensitive()
        );
    }

    private SettingCategory inferCategory(String key) {
        if (key.startsWith("whatsapp.") || key.startsWith("sms.") ||
            key.startsWith("email.") || key.startsWith("push.") ||
            key.startsWith("quiet.")) return SettingCategory.NOTIFICATIONS;
        if (key.startsWith("invoice.") || key.startsWith("payment.") ||
            key.startsWith("payhere.")) return SettingCategory.BILLING;
        if (key.startsWith("checkin.") || key.startsWith("auto.") ||
            key.startsWith("class.") || key.startsWith("locker."))
            return SettingCategory.OPERATIONS;
        if (key.startsWith("expiry.") || key.startsWith("grace.") ||
            key.startsWith("member.portal")) return SettingCategory.MEMBERSHIP;
        if (key.startsWith("max.login") || key.startsWith("lockout.") ||
            key.startsWith("session.") || key.startsWith("ip."))
            return SettingCategory.SECURITY;
        return SettingCategory.GENERAL;
    }

    private String formatLabel(SettingCategory cat) {
        return switch (cat) {
            case NOTIFICATIONS -> "Notifications";
            case BILLING -> "Billing";
            case OPERATIONS -> "Operations";
            case MEMBERSHIP -> "Membership";
            case SECURITY -> "Security";
            case INTEGRATIONS -> "Integrations";
            case FEATURES -> "Features";
            case APPEARANCE -> "Appearance";
            case GENERAL -> "General";
        };
    }
}
