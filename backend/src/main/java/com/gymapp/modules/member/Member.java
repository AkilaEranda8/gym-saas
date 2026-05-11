package com.gymapp.modules.member;

import com.gymapp.multitenancy.TenantEntity;
import com.gymapp.shared.enums.Gender;
import com.gymapp.shared.enums.MemberStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "members")
public class Member extends TenantEntity {

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "keycloak_user_id", length = 100)
    private String keycloakUserId;

    @Column(name = "first_name", nullable = false, length = 60)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 60)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(length = 255)
    private String address;

    @Column(name = "profile_photo", length = 500)
    private String profilePhoto;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private MemberStatus status = MemberStatus.ACTIVE;

    @Column(name = "join_date", nullable = false)
    private LocalDate joinDate;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "qr_code", columnDefinition = "text")
    private String qrCode;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Column(name = "nic", length = 20)
    private String nic;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "locker_id")
    private UUID lockerId;

    @Column(name = "nutrition_plan_id")
    private UUID nutritionPlanId;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
