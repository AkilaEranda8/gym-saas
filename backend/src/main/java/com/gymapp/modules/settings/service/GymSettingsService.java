package com.gymapp.modules.settings.service;

import com.gymapp.modules.settings.dto.SettingsDtos.*;
import com.gymapp.modules.settings.entity.GymSettings;
import com.gymapp.modules.settings.repository.GymSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GymSettingsService {

    private final GymSettingsRepository repo;
    private final RedisTemplate<String, Object> redis;

    private static final Duration CACHE_TTL = Duration.ofMinutes(5);
    private static final String CACHE_PREFIX = "settings:gym:";

    // ── Public API ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public GymSettingsDTO getSettings(UUID gymId) {
        return toDto(findOrCreate(gymId));
    }

    @Transactional(readOnly = true)
    public GymSettingsDTO getCached(UUID gymId) {
        String key = CACHE_PREFIX + gymId;
        Object cached = redis.opsForValue().get(key);
        if (cached instanceof GymSettingsDTO dto) return dto;
        GymSettingsDTO dto = toDto(findOrCreate(gymId));
        redis.opsForValue().set(key, dto, CACHE_TTL);
        return dto;
    }

    @Transactional
    public GymSettingsDTO update(UUID gymId, UpdateGymSettingsRequest req) {
        GymSettings s = findOrCreate(gymId);
        s.setGymName(req.gymName());
        if (req.tagline() != null) s.setTagline(req.tagline());
        if (req.description() != null) s.setDescription(req.description());
        if (req.phone() != null) s.setPhone(req.phone());
        if (req.email() != null) s.setEmail(req.email());
        if (req.website() != null) s.setWebsite(req.website());
        if (req.whatsappNumber() != null) s.setWhatsappNumber(req.whatsappNumber());
        if (req.addressLine1() != null) s.setAddressLine1(req.addressLine1());
        if (req.addressLine2() != null) s.setAddressLine2(req.addressLine2());
        if (req.city() != null) s.setCity(req.city());
        if (req.district() != null) s.setDistrict(req.district());
        if (req.postalCode() != null) s.setPostalCode(req.postalCode());
        if (req.googleMapsUrl() != null) s.setGoogleMapsUrl(req.googleMapsUrl());
        if (req.businessRegNo() != null) s.setBusinessRegNo(req.businessRegNo());
        if (req.taxNo() != null) s.setTaxNo(req.taxNo());
        if (req.invoicePrefix() != null) s.setInvoicePrefix(req.invoicePrefix());
        if (req.invoiceFooter() != null) s.setInvoiceFooter(req.invoiceFooter());
        if (req.invoiceTerms() != null) s.setInvoiceTerms(req.invoiceTerms());
        if (req.facebookUrl() != null) s.setFacebookUrl(req.facebookUrl());
        if (req.instagramUrl() != null) s.setInstagramUrl(req.instagramUrl());
        if (req.youtubeUrl() != null) s.setYoutubeUrl(req.youtubeUrl());
        if (req.tiktokUrl() != null) s.setTiktokUrl(req.tiktokUrl());
        GymSettings saved = repo.save(s);
        evictCache(gymId);
        return toDto(saved);
    }

    @Transactional
    public GymSettingsDTO updateTheme(UUID gymId, UpdateThemeRequest req) {
        GymSettings s = findOrCreate(gymId);
        s.setPrimaryColor(req.primaryColor());
        s.setSecondaryColor(req.secondaryColor());
        GymSettings saved = repo.save(s);
        evictCache(gymId);
        return toDto(saved);
    }

    @Transactional
    public GymSettingsDTO updateLocalization(UUID gymId, UpdateLocalizationRequest req) {
        GymSettings s = findOrCreate(gymId);
        s.setTimezone(req.timezone());
        s.setCurrency(req.currency());
        if (req.language() != null) s.setLanguage(req.language());
        if (req.dateFormat() != null) s.setDateFormat(req.dateFormat());
        GymSettings saved = repo.save(s);
        evictCache(gymId);
        return toDto(saved);
    }

    @Transactional
    public String uploadLogo(UUID gymId, MultipartFile file) {
        validateImageFile(file);
        String ext = getExtension(file.getOriginalFilename());
        String path = "gyms/" + gymId + "/logo." + ext;
        String url = storeFile(file, path);
        GymSettings s = findOrCreate(gymId);
        s.setLogoUrl(url);
        repo.save(s);
        evictCache(gymId);
        return url;
    }

    @Transactional
    public String uploadCoverImage(UUID gymId, MultipartFile file) {
        validateImageFile(file);
        String ext = getExtension(file.getOriginalFilename());
        String path = "gyms/" + gymId + "/cover." + ext;
        String url = storeFile(file, path);
        GymSettings s = findOrCreate(gymId);
        s.setCoverImageUrl(url);
        repo.save(s);
        evictCache(gymId);
        return url;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    GymSettings findOrCreate(UUID gymId) {
        return repo.findByGymId(gymId).orElseGet(() -> {
            GymSettings s = new GymSettings();
            s.setGymId(gymId);
            s.setGymName("My Gym");
            return repo.save(s);
        });
    }

    private void evictCache(UUID gymId) {
        redis.delete(CACHE_PREFIX + gymId);
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is empty");
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/"))
            throw new IllegalArgumentException("Only image files are allowed");
        if (file.getSize() > 2 * 1024 * 1024)
            throw new IllegalArgumentException("File size must not exceed 2MB");
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private String storeFile(MultipartFile file, String path) {
        // Cloudflare R2 / local storage integration point.
        // In production, upload to R2 and return CDN URL.
        // For now, returns a placeholder URL — replace with actual R2 upload.
        log.info("Storing file at path: {}", path);
        return "/uploads/" + path;
    }

    public GymSettingsDTO toDto(GymSettings s) {
        return new GymSettingsDTO(
            s.getId(), s.getGymId(),
            s.getGymName(), s.getTagline(), s.getDescription(),
            s.getLogoUrl(), s.getCoverImageUrl(),
            s.getPhone(), s.getEmail(), s.getWebsite(), s.getWhatsappNumber(),
            s.getAddressLine1(), s.getAddressLine2(),
            s.getCity(), s.getDistrict(), s.getPostalCode(), s.getGoogleMapsUrl(),
            s.getBusinessRegNo(), s.getTaxNo(),
            s.getOperatingHours(),
            s.getPrimaryColor(), s.getSecondaryColor(),
            s.getTimezone(), s.getCurrency(), s.getLanguage(), s.getDateFormat(),
            s.getInvoicePrefix(), s.getInvoiceFooter(), s.getInvoiceTerms(),
            s.getFacebookUrl(), s.getInstagramUrl(), s.getYoutubeUrl(), s.getTiktokUrl(),
            s.getUpdatedAt()
        );
    }
}
