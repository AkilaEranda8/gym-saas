package com.gymapp.modules.shop.entity;

import com.gymapp.multitenancy.TenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "product_categories")
@SQLRestriction("deleted_at IS NULL")
public class ProductCategory extends TenantEntity {

    @Column(nullable = false, length = 50)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 10)
    private String icon;

    @Column(length = 7)
    private String color;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
