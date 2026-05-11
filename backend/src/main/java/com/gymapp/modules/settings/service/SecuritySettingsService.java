package com.gymapp.modules.settings.service;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.entity.AuditSettings;
import com.gymapp.modules.settings.entity.LoginHistory;
import com.gymapp.modules.settings.enums.DeviceType;
import com.gymapp.modules.settings.enums.LoginStatus;
import com.gymapp.modules.settings.repository.AuditSettingsRepository;
import com.gymapp.modules.settings.repository.LoginHistoryRepository;
import com.gymapp.shared.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecuritySettingsService {

    private final AuditSettingsRepository auditRepo;
    private final LoginHistoryRepository loginRepo;

    @Transactional(readOnly = true)
    public AuditSettingsDTO getAuditSettings(UUID gymId) {
        return toAuditDto(findOrCreateAudit(gymId));
    }

    @Transactional
    public AuditSettingsDTO updateAuditSettings(UUID gymId, UpdateAuditSettingsRequest req) {
        AuditSettings s = findOrCreateAudit(gymId);
        if (req.retainDays() != null) s.setRetainDays(req.retainDays());
        s.setLogLogins(req.logLogins());
        s.setLogDataExports(req.logDataExports());
        s.setLogPaymentActions(req.logPaymentActions());
        s.setIpRestrictionEnabled(req.ipRestrictionEnabled());
        if (req.allowedIps() != null) s.setAllowedIps(req.allowedIps());
        return toAuditDto(auditRepo.save(s));
    }

    @Transactional
    public void logLogin(UUID gymId, String userId, String email, String role,
                         HttpServletRequest request, LoginStatus status, String failureReason) {
        AuditSettings audit = findOrCreateAudit(gymId);
        if (!Boolean.TRUE.equals(audit.getLogLogins())) return;

        LoginHistory h = new LoginHistory();
        h.setGymId(gymId);
        h.setUserId(userId);
        h.setUserEmail(email);
        h.setUserRole(role);
        h.setStatus(status);
        h.setFailureReason(failureReason);
        h.setLoggedAt(LocalDateTime.now());

        if (request != null) {
            h.setIpAddress(extractIp(request));
            h.setUserAgent(request.getHeader("User-Agent"));
            h.setDeviceType(detectDevice(request.getHeader("User-Agent")));
        }
        loginRepo.save(h);

        if (status == LoginStatus.FAILED) {
            checkBruteForce(gymId, userId, h.getIpAddress(), audit);
        }
    }

    @Transactional(readOnly = true)
    public SecuritySummaryDTO getSecuritySummary(UUID gymId) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        long total = loginRepo.countByGymIdAndStatusAndLoggedAtBetween(
            gymId, LoginStatus.SUCCESS, startOfDay, LocalDateTime.now())
            + loginRepo.countByGymIdAndStatusAndLoggedAtBetween(
            gymId, LoginStatus.FAILED, startOfDay, LocalDateTime.now())
            + loginRepo.countByGymIdAndStatusAndLoggedAtBetween(
            gymId, LoginStatus.BLOCKED, startOfDay, LocalDateTime.now());

        long failed = loginRepo.countByGymIdAndStatusAndLoggedAtBetween(
            gymId, LoginStatus.FAILED, startOfDay, LocalDateTime.now());
        long blocked = loginRepo.countByGymIdAndStatusAndLoggedAtBetween(
            gymId, LoginStatus.BLOCKED, startOfDay, LocalDateTime.now());
        long uniqueIps = loginRepo.countDistinctIpsByGymIdAndLoggedAtAfter(gymId, startOfDay);

        List<LoginHistoryDTO> suspicious = loginRepo.findSuspiciousActivity(gymId, startOfDay)
            .stream().limit(10).map(this::toLoginDto).collect(Collectors.toList());

        Page<LoginHistory> recent = loginRepo.findAllByGymIdOrderByLoggedAtDesc(
            gymId, PageRequest.of(0, 10));

        return new SecuritySummaryDTO(total, failed, blocked, uniqueIps,
            suspicious, recent.getContent().stream().map(this::toLoginDto).collect(Collectors.toList()));
    }

    @Transactional(readOnly = true)
    public PageResponse<LoginHistoryDTO> getLoginHistory(UUID gymId, String userId,
                                                          LoginStatus status, int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by("loggedAt").descending());
        Page<LoginHistory> result;
        if (userId != null && status != null) {
            result = loginRepo.findAllByGymIdAndUserId(gymId, userId, pr);
        } else if (userId != null) {
            result = loginRepo.findAllByGymIdAndUserId(gymId, userId, pr);
        } else if (status != null) {
            result = loginRepo.findAllByGymIdAndStatus(gymId, status, pr);
        } else {
            result = loginRepo.findAllByGymIdOrderByLoggedAtDesc(gymId, pr);
        }
        return PageResponse.from(result.map(this::toLoginDto));
    }

    public boolean isIpAllowed(UUID gymId, String ipAddress) {
        AuditSettings s = findOrCreateAudit(gymId);
        if (!Boolean.TRUE.equals(s.getIpRestrictionEnabled())) return true;
        List<String> allowed = s.getAllowedIps();
        if (allowed == null || allowed.isEmpty()) return true;
        return allowed.contains(ipAddress);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private AuditSettings findOrCreateAudit(UUID gymId) {
        return auditRepo.findByGymId(gymId).orElseGet(() -> {
            AuditSettings s = new AuditSettings();
            s.setGymId(gymId);
            return auditRepo.save(s);
        });
    }

    private void checkBruteForce(UUID gymId, String userId, String ip, AuditSettings audit) {
        LocalDateTime tenMinsAgo = LocalDateTime.now().minusMinutes(10);
        List<?> recent = loginRepo.findRecentFailedLogins(gymId, userId, tenMinsAgo);
        if (recent.size() >= 5) {
            log.warn("Brute force detected: gymId={} userId={} ip={}", gymId, userId, ip);
        }
    }

    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private DeviceType detectDevice(String ua) {
        if (ua == null) return DeviceType.API;
        String lower = ua.toLowerCase();
        if (lower.contains("mobile") || lower.contains("android") || lower.contains("iphone")) {
            return lower.contains("ipad") ? DeviceType.TABLET : DeviceType.MOBILE;
        }
        if (lower.contains("tablet") || lower.contains("ipad")) return DeviceType.TABLET;
        if (lower.contains("mozilla") || lower.contains("chrome") || lower.contains("safari")) {
            return DeviceType.DESKTOP;
        }
        return DeviceType.API;
    }

    private AuditSettingsDTO toAuditDto(AuditSettings s) {
        return new AuditSettingsDTO(
            s.getRetainDays(), s.getLogLogins(), s.getLogDataExports(),
            s.getLogPaymentActions(), s.getIpRestrictionEnabled(), s.getAllowedIps()
        );
    }

    private LoginHistoryDTO toLoginDto(LoginHistory h) {
        boolean suspicious = h.getStatus() != LoginStatus.SUCCESS;
        return new LoginHistoryDTO(
            h.getId(), h.getUserId(), h.getUserEmail(), h.getUserRole(),
            h.getIpAddress(), h.getDeviceType(), h.getLocation(),
            h.getStatus(), h.getFailureReason(), h.getLoggedAt(), suspicious
        );
    }
}
