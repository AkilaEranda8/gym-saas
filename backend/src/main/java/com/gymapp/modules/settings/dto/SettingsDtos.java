package com.gymapp.modules.settings.dto;

import com.gymapp.modules.settings.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class SettingsDtos {

    private SettingsDtos() {}

    // ── REQUEST DTOs ──────────────────────────────────────────────────────────

    public record UpdateGymSettingsRequest(
        @NotBlank @Size(max = 100) String gymName,
        String tagline,
        String description,
        @Pattern(regexp = "^(\\+94|0)[0-9]{9}$|^$", message = "Invalid Sri Lanka phone format")
        String phone,
        @Email String email,
        String website,
        String whatsappNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String district,
        String postalCode,
        String googleMapsUrl,
        String businessRegNo,
        String taxNo,
        @Size(max = 10) String invoicePrefix,
        String invoiceFooter,
        String invoiceTerms,
        String facebookUrl,
        String instagramUrl,
        String youtubeUrl,
        String tiktokUrl
    ) {}

    public record UpdateThemeRequest(
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid hex color")
        String primaryColor,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid hex color")
        String secondaryColor
    ) {}

    public record UpdateLocalizationRequest(
        @NotBlank String timezone,
        @NotBlank String currency,
        String language,
        String dateFormat
    ) {}

    public record UpdateSettingKVRequest(
        @NotNull Map<String, String> values
    ) {}

    public record UpdateIntegrationRequest(
        Boolean isEnabled,
        Boolean testMode,
        Map<String, String> config
    ) {}

    public record TestIntegrationRequest(
        @NotNull IntegrationProvider provider
    ) {}

    public record UpdateMembershipPlanRequest(
        @NotBlank String displayName,
        @NotNull @Min(1) Long priceLkr,
        @NotNull @Min(1) Integer durationDays,
        String color,
        String description,
        List<String> features,
        Integer maxClassesPerWeek,
        Integer maxPtSessions,
        boolean lockerIncluded,
        Integer guestPasses,
        BigDecimal discountPct,
        boolean isActive
    ) {}

    public record UpdateOperatingHoursRequest(
        @NotNull @Valid List<DayHoursRequest> hours
    ) {}

    public record DayHoursRequest(
        @NotNull @Min(1) @Max(7) Integer dayOfWeek,
        boolean isOpen,
        LocalTime openTime,
        LocalTime closeTime,
        String notes,
        String branchId
    ) {}

    public record CreateHolidayRequest(
        @NotBlank String name,
        @NotNull LocalDate holidayDate,
        boolean isClosed,
        LocalTime openTime,
        LocalTime closeTime,
        String notes,
        boolean isRecurring
    ) {}

    public record UpdateFeatureFlagsRequest(
        @NotNull Map<String, Boolean> flags
    ) {}

    public record UpdateAuditSettingsRequest(
        @Min(30) @Max(365) Integer retainDays,
        boolean logLogins,
        boolean logDataExports,
        boolean logPaymentActions,
        boolean ipRestrictionEnabled,
        List<String> allowedIps
    ) {}

    // ── RESPONSE DTOs ─────────────────────────────────────────────────────────

    public record GymSettingsDTO(
        UUID id,
        UUID gymId,
        String gymName,
        String tagline,
        String description,
        String logoUrl,
        String coverImageUrl,
        String phone,
        String email,
        String website,
        String whatsappNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String district,
        String postalCode,
        String googleMapsUrl,
        String businessRegNo,
        String taxNo,
        Object operatingHours,
        String primaryColor,
        String secondaryColor,
        String timezone,
        String currency,
        String language,
        String dateFormat,
        String invoicePrefix,
        String invoiceFooter,
        String invoiceTerms,
        String facebookUrl,
        String instagramUrl,
        String youtubeUrl,
        String tiktokUrl,
        LocalDateTime updatedAt
    ) {}

    public record SettingKVDTO(
        String key,
        String value,
        String valueType,
        SettingCategory category,
        String description,
        Boolean isSensitive
    ) {}

    public record SettingsByCategoryDTO(
        SettingCategory category,
        String categoryLabel,
        List<SettingKVDTO> settings
    ) {}

    public record IntegrationDTO(
        UUID id,
        UUID gymId,
        IntegrationProvider provider,
        String providerLabel,
        Boolean isEnabled,
        Boolean testMode,
        Map<String, String> config,
        LocalDateTime lastTestedAt,
        IntegrationTestStatus lastTestStatus,
        String lastTestMessage,
        boolean isConfigured
    ) {}

    public record IntegrationTestResultDTO(
        IntegrationProvider provider,
        IntegrationTestStatus status,
        String message,
        long responseTimeMs,
        LocalDateTime testedAt
    ) {}

    public record MembershipPlanConfigDTO(
        UUID id,
        UUID gymId,
        String planName,
        String displayName,
        Long priceLkr,
        String priceFormatted,
        Integer durationDays,
        String durationLabel,
        String color,
        String description,
        List<String> features,
        Integer maxClassesPerWeek,
        Integer maxPtSessions,
        Boolean lockerIncluded,
        Integer guestPasses,
        BigDecimal discountPct,
        Boolean isActive,
        Integer sortOrder
    ) {}

    public record OperatingHoursDTO(
        UUID gymId,
        UUID branchId,
        List<DayScheduleDTO> schedule,
        boolean isOpenNow,
        String nextOpenTime
    ) {}

    public record DayScheduleDTO(
        int dayOfWeek,
        String dayName,
        boolean isOpen,
        LocalTime openTime,
        LocalTime closeTime,
        String notes
    ) {}

    public record HolidayDTO(
        UUID id,
        UUID gymId,
        String name,
        LocalDate holidayDate,
        Boolean isClosed,
        LocalTime openTime,
        LocalTime closeTime,
        String notes,
        Boolean isRecurring,
        boolean isToday,
        boolean isPast
    ) {}

    public record FeatureFlagDTO(
        FeatureKey featureKey,
        String featureLabel,
        String description,
        Boolean isEnabled,
        Boolean enabledByPlan,
        String requiredPlan,
        boolean isAvailableOnCurrentPlan,
        Boolean overrideByAdmin
    ) {}

    public record AllFeaturesDTO(
        String currentPlan,
        List<FeatureFlagDTO> features,
        long enabledCount,
        long disabledCount
    ) {}

    public record AuditSettingsDTO(
        Integer retainDays,
        Boolean logLogins,
        Boolean logDataExports,
        Boolean logPaymentActions,
        Boolean ipRestrictionEnabled,
        List<String> allowedIps
    ) {}

    public record LoginHistoryDTO(
        UUID id,
        String userId,
        String userEmail,
        String userRole,
        String ipAddress,
        DeviceType deviceType,
        String location,
        LoginStatus status,
        String failureReason,
        LocalDateTime loggedAt,
        boolean isSuspicious
    ) {}

    public record SecuritySummaryDTO(
        long loginAttemptsToday,
        long failedLoginsToday,
        long blockedAttempts,
        long uniqueIpsToday,
        List<LoginHistoryDTO> suspiciousActivity,
        List<LoginHistoryDTO> recentLogins
    ) {}

    public record FullSettingsDTO(
        GymSettingsDTO gymSettings,
        List<SettingsByCategoryDTO> byCategory,
        List<IntegrationDTO> integrations,
        List<MembershipPlanConfigDTO> membershipPlans,
        OperatingHoursDTO operatingHours,
        List<HolidayDTO> upcomingHolidays,
        AllFeaturesDTO features,
        AuditSettingsDTO auditSettings
    ) {}
}
