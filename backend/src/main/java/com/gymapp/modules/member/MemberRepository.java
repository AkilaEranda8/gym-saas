package com.gymapp.modules.member;

import com.gymapp.shared.enums.MemberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, UUID> {

    Page<Member> findAllByGymId(UUID gymId, Pageable pageable);
    Page<Member> findAllByGymIdAndBranchId(UUID gymId, UUID branchId, Pageable pageable);
    Page<Member> findAllByGymIdAndStatus(UUID gymId, MemberStatus status, Pageable pageable);
    Optional<Member> findByIdAndGymId(UUID id, UUID gymId);
    Optional<Member> findByEmailAndGymId(String email, UUID gymId);
    boolean existsByEmailAndGymId(String email, UUID gymId);
    boolean existsByPhoneAndGymId(String phone, UUID gymId);
    boolean existsByNicAndGymId(String nic, UUID gymId);
    long countByGymIdAndStatus(UUID gymId, MemberStatus status);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.gymId = :gymId AND m.deletedAt IS NULL")
    long countByGymId(UUID gymId);

    @Query("SELECT COUNT(m) FROM Member m WHERE m.gymId = :gymId AND m.deletedAt IS NULL AND m.joinDate >= :from")
    long countByGymIdAndJoinDateAfter(UUID gymId, LocalDate from);

    @Query("""
        SELECT m FROM Member m
        WHERE m.gymId = :gymId
          AND m.deletedAt IS NULL
          AND (:search = '' OR LOWER(m.firstName) LIKE CONCAT('%',:search,'%')
               OR LOWER(m.lastName) LIKE CONCAT('%',:search,'%')
               OR LOWER(m.email) LIKE CONCAT('%',:search,'%')
               OR m.phone LIKE CONCAT('%',:search,'%')
               OR m.nic LIKE CONCAT('%',:search,'%'))
          AND (:status IS NULL OR m.status = :status)
          AND (:branchId IS NULL OR m.branchId = :branchId)
        """)
    Page<Member> searchMembers(UUID gymId, String search, MemberStatus status, UUID branchId, Pageable pageable);

    @Query("""
        SELECT m FROM Member m
        WHERE m.gymId = :gymId
          AND m.deletedAt IS NULL
          AND m.expiryDate BETWEEN :fromDate AND :toDate
        """)
    List<Member> findExpiringMembers(UUID gymId, LocalDate fromDate, LocalDate toDate);

    @Query("""
        SELECT m FROM Member m
        WHERE m.gymId = :gymId
          AND m.deletedAt IS NULL
          AND m.expiryDate < :today
          AND m.status NOT IN ('EXPIRED','SUSPENDED','INACTIVE')
        """)
    List<Member> findExpiredNotUpdated(UUID gymId, LocalDate today);
}
