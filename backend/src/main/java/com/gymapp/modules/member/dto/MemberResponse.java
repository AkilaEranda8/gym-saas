package com.gymapp.modules.member.dto;

import com.gymapp.modules.member.Member;
import com.gymapp.shared.enums.Gender;
import com.gymapp.shared.enums.MemberStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record MemberResponse(
    UUID id,
    UUID gymId,
    UUID branchId,
    String firstName,
    String lastName,
    String fullName,
    String email,
    String phone,
    LocalDate dateOfBirth,
    Gender gender,
    String address,
    String profilePhoto,
    MemberStatus status,
    LocalDate joinDate,
    String emergencyContactName,
    String emergencyContactPhone,
    String notes,
    LocalDateTime createdAt
) {
    public static MemberResponse from(Member m) {
        return new MemberResponse(
            m.getId(), m.getGymId(), m.getBranchId(),
            m.getFirstName(), m.getLastName(),
            m.getFirstName() + " " + m.getLastName(),
            m.getEmail(), m.getPhone(), m.getDateOfBirth(),
            m.getGender(), m.getAddress(), m.getProfilePhoto(),
            m.getStatus(), m.getJoinDate(),
            m.getEmergencyContactName(), m.getEmergencyContactPhone(),
            m.getNotes(), m.getCreatedAt()
        );
    }
}
