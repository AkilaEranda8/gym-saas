package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.enums.EquipmentCondition;
import com.gymapp.modules.equipment.enums.EquipmentStatus;
import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "equipment")
@SQLRestriction("deleted_at IS NULL")
public class Equipment extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 50)
    private String brand;

    @Column(length = 50)
    private String model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "asset_tag", length = 50)
    private String assetTag;

    @Column(length = 100)
    private String location;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_price_lkr")
    private Long purchasePriceLkr;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EquipmentStatus status = EquipmentStatus.OPERATIONAL;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private EquipmentCondition condition = EquipmentCondition.GOOD;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;

    @Column(name = "service_interval_days")
    private Integer serviceIntervalDays = 90;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "qr_code", length = 50, unique = true)
    private String qrCode;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private EquipmentCategory category;

    @Transient
    public boolean isServiceOverdue() {
        return nextServiceDate != null && nextServiceDate.isBefore(LocalDate.now())
               && status != EquipmentStatus.RETIRED;
    }

    @Transient
    public boolean isWarrantyExpired() {
        return warrantyExpiry != null && warrantyExpiry.isBefore(LocalDate.now());
    }

    @Transient
    public long getDaysUntilService() {
        if (nextServiceDate == null) return Long.MAX_VALUE;
        return ChronoUnit.DAYS.between(LocalDate.now(), nextServiceDate);
    }
}
