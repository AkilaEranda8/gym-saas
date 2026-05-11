package com.gymapp.modules.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PushTokenRepository extends JpaRepository<PushToken, UUID> {

    List<PushToken> findAllByUserIdAndIsActiveTrue(String userId);

    List<PushToken> findAllByGymIdAndIsActiveTrue(UUID gymId);

    Optional<PushToken> findByUserIdAndToken(String userId, String token);

    @Modifying
    @Transactional
    @Query("UPDATE PushToken t SET t.isActive = false WHERE t.userId = :userId AND t.token = :token")
    void deactivateByUserIdAndToken(@Param("userId") String userId, @Param("token") String token);

    @Modifying
    @Transactional
    @Query("UPDATE PushToken t SET t.isActive = false WHERE t.token IN :tokens")
    void deactivateByTokens(@Param("tokens") List<String> tokens);
}
