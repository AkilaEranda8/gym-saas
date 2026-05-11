package com.gymapp.modules.classes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassWaitlistRepository extends JpaRepository<ClassWaitlist, UUID> {

    Optional<ClassWaitlist> findBySessionIdAndMemberId(UUID sessionId, UUID memberId);

    List<ClassWaitlist> findAllBySessionIdOrderByPosition(UUID sessionId);

    Optional<ClassWaitlist> findFirstBySessionIdOrderByPositionAsc(UUID sessionId);

    long countBySessionId(UUID sessionId);

    void deleteBySessionIdAndMemberId(UUID sessionId, UUID memberId);
}
