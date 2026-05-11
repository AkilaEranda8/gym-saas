package com.gymapp.modules.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface WaterLogRepository extends JpaRepository<WaterLog, UUID> {

    List<WaterLog> findAllByMemberIdAndLogDate(UUID memberId, LocalDate logDate);

    @Query("SELECT COALESCE(SUM(w.amountMl), 0) FROM WaterLog w WHERE w.memberId = :memberId AND w.logDate = :logDate")
    Integer sumWaterByMemberIdAndLogDate(@Param("memberId") UUID memberId, @Param("logDate") LocalDate logDate);

    List<WaterLog> findAllByMemberIdAndLogDateBetween(UUID memberId, LocalDate from, LocalDate to);
}
