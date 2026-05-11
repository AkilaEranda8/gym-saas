package com.gymapp.modules.settings.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "gym_settings")
public class GymSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false, unique = true)
    private UUID gymId;

    @Column(name = "gym_name", nullable = false, length = 100)
    private String gymName;

    @Column(length = 200)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 255)
    private String logoUrl;

    @Column(name = "cover_image_url", length = 255)
    private String coverImageUrl;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String website;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String district;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column(name = "google_maps_url", length = 500)
    private String googleMapsUrl;

    @Column(name = "business_reg_no", length = 50)
    private String businessRegNo;

    @Column(name = "tax_no", length = 50)
    private String taxNo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "operating_hours", columnDefinition = "jsonb")
    private JsonNode operatingHours;

    @Column(name = "primary_color", length = 7)
    private String primaryColor = "#f59e0b";

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor = "#1e293b";

    @Column(length = 50)
    private String timezone = "Asia/Colombo";

    @Column(length = 10)
    private String currency = "LKR";

    @Column(length = 5)
    private String language = "en";

    @Column(name = "date_format", length = 20)
    private String dateFormat = "DD/MM/YYYY";

    @Column(name = "invoice_prefix", length = 10)
    private String invoicePrefix = "INV";

    @Column(name = "invoice_footer", columnDefinition = "TEXT")
    private String invoiceFooter;

    @Column(name = "invoice_terms", columnDefinition = "TEXT")
    private String invoiceTerms;

    @Column(name = "facebook_url", length = 255)
    private String facebookUrl;

    @Column(name = "instagram_url", length = 255)
    private String instagramUrl;

    @Column(name = "youtube_url", length = 255)
    private String youtubeUrl;

    @Column(name = "tiktok_url", length = 255)
    private String tiktokUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
