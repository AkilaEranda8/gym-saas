package com.gymapp.modules.billing;

import com.gymapp.shared.enums.PaymentStatus;
import com.gymapp.shared.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    @Query("SELECT p FROM Payment p WHERE p.gymId = :gymId "
         + "AND (:memberId IS NULL OR p.memberId = :memberId) "
         + "AND (:status IS NULL OR p.status = :status) "
         + "AND (:type IS NULL OR p.paymentType = :type) "
         + "AND (:method IS NULL OR p.method = :method) "
         + "AND p.createdAt >= :from "
         + "AND p.createdAt <= :to")
    Page<Payment> findAllWithFilters(
            @Param("gymId") UUID gymId,
            @Param("memberId") UUID memberId,
            @Param("status") PaymentStatus status,
            @Param("type") PaymentType type,
            @Param("method") PaymentMethod method,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    Optional<Payment> findByIdAndGymId(UUID id, UUID gymId);

    Optional<Payment> findByPaymentNumberAndGymId(String paymentNumber, UUID gymId);

    Optional<Payment> findByPayhereOrderId(String orderId);

    @Query("SELECT COALESCE(SUM(p.finalAmountLkr), 0) FROM Payment p "
         + "WHERE p.gymId = :gymId AND p.status = 'PAID' "
         + "AND p.paidAt BETWEEN :from AND :to")
    Long sumByGymIdAndStatusPaidAndPaidAtBetween(
            @Param("gymId") UUID gymId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    long countByGymIdAndStatus(UUID gymId, PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.memberId = :memberId AND p.status = 'PENDING' AND p.deletedAt IS NULL")
    List<Payment> findPendingByMemberId(@Param("memberId") UUID memberId);

    Page<Payment> findByGymIdAndMemberIdOrderByCreatedAtDesc(UUID gymId, UUID memberId, Pageable pageable);

    @Query("SELECT FUNCTION('TO_CHAR', p.paidAt, 'YYYY-MM') AS month, "
         + "COALESCE(SUM(p.finalAmountLkr), 0) AS revenue, COUNT(p) AS cnt "
         + "FROM Payment p WHERE p.gymId = :gymId AND p.status = 'PAID' "
         + "AND p.paidAt BETWEEN :from AND :to "
         + "GROUP BY FUNCTION('TO_CHAR', p.paidAt, 'YYYY-MM') "
         + "ORDER BY month ASC")
    List<Object[]> getMonthlyRevenueSummary(
            @Param("gymId") UUID gymId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT p.paymentType, COALESCE(SUM(p.finalAmountLkr), 0), COUNT(p) "
         + "FROM Payment p WHERE p.gymId = :gymId AND p.status = 'PAID' "
         + "AND p.paidAt BETWEEN :from AND :to "
         + "GROUP BY p.paymentType")
    List<Object[]> getRevenueByType(
            @Param("gymId") UUID gymId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("SELECT MAX(CAST(SUBSTRING(p.paymentNumber, 10) AS integer)) FROM Payment p WHERE p.gymId = :gymId")
    Integer findMaxSequenceByGymId(@Param("gymId") UUID gymId);

    @Query("SELECT COALESCE(SUM(p.finalAmountLkr), 0) FROM Payment p "
         + "WHERE p.gymId = :gymId AND p.status = 'PAID' "
         + "AND p.paidAt BETWEEN :from AND :to")
    Long sumRevenueBetween(
            @Param("gymId") UUID gymId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    Page<Payment> findAllByGymId(UUID gymId, Pageable pageable);

    Page<Payment> findAllByGymIdAndMemberId(UUID gymId, UUID memberId, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.gymId = :gymId AND p.status = 'PENDING' "
         + "AND p.dueDate < :today AND p.deletedAt IS NULL")
    List<Payment> findOverduePayments(@Param("gymId") UUID gymId, @Param("today") LocalDate today);

    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' "
         + "AND p.dueDate < :today AND p.deletedAt IS NULL")
    List<Payment> findAllOverduePayments(@Param("today") LocalDate today);
}
