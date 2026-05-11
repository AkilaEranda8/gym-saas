package com.gymapp.modules.member;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BodyMetricRepository extends JpaRepository<BodyMetric, UUID> {

    List<BodyMetric> findTop12ByMemberIdOrderByRecordedDateDesc(UUID memberId);

    Optional<BodyMetric> findTopByMemberIdOrderByRecordedDateDesc(UUID memberId);
}
