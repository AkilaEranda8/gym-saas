package com.gymapp.modules.settings.repository;

import com.gymapp.modules.settings.entity.LoginHistory;
import com.gymapp.modules.settings.enums.LoginStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {

    Page<LoginHistory> findAllByGymIdOrderByLoggedAtDesc(UUID gymId, Pageable pageable);

    Page<LoginHistory> findAllByGymIdAndUserId(UUID gymId, String userId, Pageable pageable);

    Page<LoginHistory> findAllByGymIdAndStatus(UUID gymId, LoginStatus status, Pageable pageable);

    long countByGymIdAndStatusAndLoggedAtBetween(UUID gymId, LoginStatus status,
                                                  LocalDateTime from, LocalDateTime to);

    @Query("SELECT l FROM LoginHistory l WHERE l.gymId = :gymId AND l.userId = :userId " +
           "AND l.status = 'FAILED' AND l.loggedAt >= :from ORDER BY l.loggedAt DESC")
    List<LoginHistory> findRecentFailedLogins(@Param("gymId") UUID gymId,
                                               @Param("userId") String userId,
                                               @Param("from") LocalDateTime from);

    Page<LoginHistory> findByGymIdAndIpAddress(UUID gymId, String ipAddress, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT l.ipAddress) FROM LoginHistory l " +
           "WHERE l.gymId = :gymId AND l.loggedAt >= :from")
    long countDistinctIpsByGymIdAndLoggedAtAfter(@Param("gymId") UUID gymId,
                                                  @Param("from") LocalDateTime from);

    @Query("SELECT l FROM LoginHistory l WHERE l.gymId = :gymId " +
           "AND l.status != 'SUCCESS' AND l.loggedAt >= :from ORDER BY l.loggedAt DESC")
    List<LoginHistory> findSuspiciousActivity(@Param("gymId") UUID gymId,
                                               @Param("from") LocalDateTime from);

    @Query("SELECT l FROM LoginHistory l WHERE l.gymId = :gymId " +
           "AND l.userId = :userId AND l.status != :status AND l.loggedAt >= :from")
    List<LoginHistory> findAllByGymIdAndUserIdAndStatusNotAndLoggedAtAfter(
            @Param("gymId") UUID gymId, @Param("userId") String userId,
            @Param("status") LoginStatus status, @Param("from") LocalDateTime from);
}
