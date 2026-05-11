package com.gymapp.modules.settings.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymapp.modules.settings.entity.*;
import com.gymapp.modules.settings.enums.FeatureKey;
import com.gymapp.modules.settings.enums.IntegrationProvider;
import com.gymapp.modules.settings.enums.IntegrationTestStatus;
import com.gymapp.modules.settings.enums.SettingCategory;
import com.gymapp.modules.settings.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsInitializerService {

    private final GymSettingsRepository gymSettingsRepo;
    private final GymSettingKVRepository kvRepo;
    private final IntegrationSettingRepository integrationRepo;
    private final MembershipPlanConfigRepository planRepo;
    private final OperatingHoursRepository hoursRepo;
    private final HolidayConfigRepository holidayRepo;
    private final FeatureFlagRepository featureRepo;
    private final AuditSettingsRepository auditRepo;
    private final ObjectMapper objectMapper;

    @Transactional
    public void initializeGymSettings(UUID gymId) {
        if (gymSettingsRepo.existsByGymId(gymId)) {
            log.debug("Settings already initialized for gymId={}", gymId);
            return;
        }
        log.info("Initializing settings for gymId={}", gymId);
        createGymSettings(gymId);
        createDefaultKVSettings(gymId);
        createDefaultIntegrations(gymId);
        createDefaultPlans(gymId);
        createDefaultOperatingHours(gymId);
        createDefaultFeatureFlags(gymId);
        createAuditSettings(gymId);
        seedSriLankanHolidays(gymId, LocalDate.now().getYear());
    }

    // ── Private initializers ──────────────────────────────────────────────────

    private void createGymSettings(UUID gymId) {
        GymSettings s = new GymSettings();
        s.setGymId(gymId);
        s.setGymName("My Gym");
        s.setPrimaryColor("#f59e0b");
        s.setSecondaryColor("#1e293b");
        s.setTimezone("Asia/Colombo");
        s.setCurrency("LKR");
        s.setLanguage("en");
        s.setDateFormat("DD/MM/YYYY");
        s.setInvoicePrefix("INV");
        gymSettingsRepo.save(s);
    }

    private void createDefaultKVSettings(UUID gymId) {
        List<Object[]> defaults = List.of(
            new Object[]{"whatsapp.enabled", "true", "BOOLEAN", SettingCategory.NOTIFICATIONS, "Enable WhatsApp notifications", false},
            new Object[]{"sms.enabled", "true", "BOOLEAN", SettingCategory.NOTIFICATIONS, "Enable SMS notifications", false},
            new Object[]{"email.enabled", "true", "BOOLEAN", SettingCategory.NOTIFICATIONS, "Enable email notifications", false},
            new Object[]{"push.enabled", "true", "BOOLEAN", SettingCategory.NOTIFICATIONS, "Enable push notifications", false},
            new Object[]{"quiet.hours.start", "22:00", "STRING", SettingCategory.NOTIFICATIONS, "Quiet hours start time", false},
            new Object[]{"quiet.hours.end", "07:00", "STRING", SettingCategory.NOTIFICATIONS, "Quiet hours end time", false},
            new Object[]{"checkin.method", "QR", "STRING", SettingCategory.OPERATIONS, "Default check-in method (QR/MANUAL)", false},
            new Object[]{"auto.checkout.hours", "0", "INTEGER", SettingCategory.OPERATIONS, "Auto-checkout after hours (0=disabled)", false},
            new Object[]{"class.advance.booking.days", "14", "INTEGER", SettingCategory.OPERATIONS, "Max days in advance for class booking", false},
            new Object[]{"class.cancellation.notice.hours", "1", "INTEGER", SettingCategory.OPERATIONS, "Minimum notice hours for class cancellation", false},
            new Object[]{"locker.auto.release.days", "7", "INTEGER", SettingCategory.OPERATIONS, "Days after expiry to auto-release locker", false},
            new Object[]{"expiry.reminder.days", "7,3,1", "STRING", SettingCategory.MEMBERSHIP, "Days before expiry to send reminders", false},
            new Object[]{"auto.suspend.on.expiry", "false", "BOOLEAN", SettingCategory.MEMBERSHIP, "Auto-suspend member on plan expiry", false},
            new Object[]{"grace.period.days", "3", "INTEGER", SettingCategory.MEMBERSHIP, "Grace period days after plan expiry", false},
            new Object[]{"member.portal.enabled", "true", "BOOLEAN", SettingCategory.MEMBERSHIP, "Enable member self-service portal", false},
            new Object[]{"invoice.due.days", "7", "INTEGER", SettingCategory.BILLING, "Default days until invoice is due", false},
            new Object[]{"auto.payment.reminders", "true", "BOOLEAN", SettingCategory.BILLING, "Send automatic payment reminders", false},
            new Object[]{"payhere.test.mode", "true", "BOOLEAN", SettingCategory.BILLING, "Use PayHere sandbox mode", false},
            new Object[]{"default.payment.method", "CASH", "STRING", SettingCategory.BILLING, "Default payment method", false},
            new Object[]{"max.login.attempts", "5", "INTEGER", SettingCategory.SECURITY, "Max failed login attempts before lockout", false},
            new Object[]{"lockout.duration.minutes", "30", "INTEGER", SettingCategory.SECURITY, "Account lockout duration in minutes", false},
            new Object[]{"session.timeout.minutes", "480", "INTEGER", SettingCategory.SECURITY, "Session timeout in minutes", false},
            new Object[]{"ip.restriction.enabled", "false", "BOOLEAN", SettingCategory.SECURITY, "Enable IP address restriction", false}
        );

        for (Object[] row : defaults) {
            GymSettingKV kv = new GymSettingKV();
            kv.setGymId(gymId);
            kv.setKey((String) row[0]);
            kv.setValue((String) row[1]);
            kv.setValueType((String) row[2]);
            kv.setCategory((SettingCategory) row[3]);
            kv.setDescription((String) row[4]);
            kv.setIsSensitive((Boolean) row[5]);
            kvRepo.save(kv);
        }
    }

    private void createDefaultIntegrations(UUID gymId) {
        for (IntegrationProvider provider : IntegrationProvider.values()) {
            IntegrationSetting s = new IntegrationSetting();
            s.setGymId(gymId);
            s.setProvider(provider);
            s.setIsEnabled(false);
            s.setTestMode(true);
            s.setConfigJson(objectMapper.createObjectNode());
            s.setLastTestStatus(IntegrationTestStatus.UNTESTED);
            integrationRepo.save(s);
        }
    }

    private void createDefaultPlans(UUID gymId) {
        createPlan(gymId, "STANDARD", "Standard", 350000L, 0,
            "#64748b", "Basic gym membership with essential access",
            List.of("Basic equipment access", "Locker (optional)", "1 class/week"),
            1, 0, false, 0);
        createPlan(gymId, "PREMIUM", "Premium", 650000L, 1,
            "#f59e0b", "Premium membership with enhanced benefits",
            List.of("All equipment", "Dedicated locker", "3 classes/week", "1 PT session/month"),
            3, 1, true, 0);
        createPlan(gymId, "ELITE", "Elite", 1200000L, 2,
            "#a855f7", "All-inclusive elite membership",
            List.of("All equipment", "Premium locker", "Unlimited classes",
                "4 PT sessions/month", "Nutrition plan", "Body analysis monthly"),
            -1, 4, true, 0);
    }

    private void createPlan(UUID gymId, String planName, String displayName,
                             long priceLkr, int sortOrder, String color,
                             String description, List<String> features,
                             int maxClasses, int maxPt, boolean locker, int guests) {
        MembershipPlanConfig cfg = new MembershipPlanConfig();
        cfg.setGymId(gymId);
        cfg.setPlanName(planName);
        cfg.setDisplayName(displayName);
        cfg.setPriceLkr(priceLkr);
        cfg.setDurationDays(30);
        cfg.setSortOrder(sortOrder);
        cfg.setColor(color);
        cfg.setDescription(description);
        cfg.setFeatures(objectMapper.valueToTree(features));
        cfg.setMaxClassesPerWeek(maxClasses);
        cfg.setMaxPtSessions(maxPt);
        cfg.setLockerIncluded(locker);
        cfg.setGuestPasses(guests);
        cfg.setIsActive(true);
        planRepo.save(cfg);
    }

    private void createDefaultOperatingHours(UUID gymId) {
        for (int day = 1; day <= 7; day++) {
            OperatingHoursConfig cfg = new OperatingHoursConfig();
            cfg.setGymId(gymId);
            cfg.setDayOfWeek(day);
            cfg.setIsOpen(true);
            if (day <= 5) {
                cfg.setOpenTime(LocalTime.of(5, 0));
                cfg.setCloseTime(LocalTime.of(22, 0));
            } else if (day == 6) {
                cfg.setOpenTime(LocalTime.of(6, 0));
                cfg.setCloseTime(LocalTime.of(20, 0));
            } else {
                cfg.setOpenTime(LocalTime.of(7, 0));
                cfg.setCloseTime(LocalTime.of(18, 0));
            }
            hoursRepo.save(cfg);
        }
    }

    private void createDefaultFeatureFlags(UUID gymId) {
        for (FeatureKey key : FeatureKey.values()) {
            FeatureFlag flag = new FeatureFlag();
            flag.setGymId(gymId);
            flag.setFeatureKey(key);
            flag.setIsEnabled(true);
            flag.setEnabledByPlan(false);
            flag.setOverrideByAdmin(false);
            featureRepo.save(flag);
        }
    }

    private void createAuditSettings(UUID gymId) {
        if (auditRepo.existsByGymId(gymId)) return;
        AuditSettings s = new AuditSettings();
        s.setGymId(gymId);
        auditRepo.save(s);
    }

    public void seedSriLankanHolidays(UUID gymId, int year) {
        List<Object[]> holidays = new ArrayList<>();
        holidays.add(new Object[]{"New Year's Day", LocalDate.of(year, 1, 1), true});
        holidays.add(new Object[]{"Tamil Thai Pongal Day", LocalDate.of(year, 1, 14), true});
        holidays.add(new Object[]{"National Day", LocalDate.of(year, 2, 4), true});
        holidays.add(new Object[]{"Day Before Sinhala & Tamil New Year", LocalDate.of(year, 4, 13), true});
        holidays.add(new Object[]{"Sinhala & Tamil New Year", LocalDate.of(year, 4, 14), true});
        holidays.add(new Object[]{"May Day", LocalDate.of(year, 5, 1), true});
        holidays.add(new Object[]{"National Heroes Day", LocalDate.of(year, 5, 22), true});
        holidays.add(new Object[]{"Christmas Day", LocalDate.of(year, 12, 25), true});

        if (year == 2026) {
            holidays.add(new Object[]{"Duruthu Full Moon Poya", LocalDate.of(2026, 1, 26), true});
            holidays.add(new Object[]{"Navam Full Moon Poya", LocalDate.of(2026, 2, 23), true});
            holidays.add(new Object[]{"Madin Full Moon Poya", LocalDate.of(2026, 3, 25), true});
            holidays.add(new Object[]{"Bak Full Moon Poya", LocalDate.of(2026, 4, 23), true});
            holidays.add(new Object[]{"Vesak Full Moon Poya", LocalDate.of(2026, 5, 23), true});
            holidays.add(new Object[]{"Poson Full Moon Poya", LocalDate.of(2026, 6, 21), true});
            holidays.add(new Object[]{"Esala Full Moon Poya", LocalDate.of(2026, 7, 20), true});
            holidays.add(new Object[]{"Nikini Full Moon Poya", LocalDate.of(2026, 8, 19), true});
            holidays.add(new Object[]{"Binara Full Moon Poya", LocalDate.of(2026, 9, 17), true});
            holidays.add(new Object[]{"Vap Full Moon Poya", LocalDate.of(2026, 10, 17), true});
            holidays.add(new Object[]{"Deepavali", LocalDate.of(2026, 10, 20), true});
            holidays.add(new Object[]{"Il Full Moon Poya", LocalDate.of(2026, 11, 15), true});
            holidays.add(new Object[]{"Unduvap Full Moon Poya", LocalDate.of(2026, 12, 14), true});
        }

        for (Object[] row : holidays) {
            if (holidayRepo.findByGymIdAndHolidayDate(gymId, (LocalDate) row[1]).isEmpty()) {
                HolidayConfig h = new HolidayConfig();
                h.setGymId(gymId);
                h.setName((String) row[0]);
                h.setHolidayDate((LocalDate) row[1]);
                h.setIsClosed((Boolean) row[2]);
                h.setIsRecurring(false);
                holidayRepo.save(h);
            }
        }
    }
}
