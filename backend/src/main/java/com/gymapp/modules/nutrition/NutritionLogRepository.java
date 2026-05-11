package com.gymapp.modules.nutrition;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NutritionLogRepository extends JpaRepository<NutritionLog, UUID> {

    Optional<NutritionLog> findByMemberIdAndLogDate(UUID memberId, LocalDate logDate);

    List<NutritionLog> findAllByMemberIdAndLogDateBetweenOrderByLogDateDesc(UUID memberId, LocalDate from, LocalDate to);

    Page<NutritionLog> findAllByAssignmentIdOrderByLogDateDesc(UUID assignmentId, Pageable pageable);

    @Query("SELECT AVG(n.totalCalories) FROM NutritionLog n WHERE n.memberId = :memberId AND n.logDate BETWEEN :from AND :to")
    Double getAverageCaloriesByMemberIdAndDateRange(@Param("memberId") UUID memberId,
                                                    @Param("from") LocalDate from,
                                                    @Param("to") LocalDate to);

    long countByMemberIdAndLogDateBetween(UUID memberId, LocalDate from, LocalDate to);

    @Query("SELECT n.logDate FROM NutritionLog n WHERE n.memberId = :memberId AND YEAR(n.logDate) = :year AND MONTH(n.logDate) = :month")
    List<LocalDate> findLogDatesByMemberAndYearMonth(@Param("memberId") UUID memberId,
                                                     @Param("year") int year,
                                                     @Param("month") int month);

    @Query("""
        SELECT n FROM NutritionLog n
        WHERE n.memberId = :memberId
          AND (:from IS NULL OR n.logDate >= :from)
          AND (:to IS NULL OR n.logDate <= :to)
        ORDER BY n.logDate DESC
        """)
    Page<NutritionLog> findByMemberIdAndDateRange(
        @Param("memberId") UUID memberId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        Pageable pageable);
}
