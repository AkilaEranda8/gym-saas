package com.gymapp.modules.billing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    @Query("SELECT e FROM Expense e WHERE e.gymId = :gymId "
         + "AND (:branchId IS NULL OR e.branchId = :branchId) "
         + "AND (:categoryId IS NULL OR e.categoryId = :categoryId) "
         + "AND e.expenseDate >= :from "
         + "AND e.expenseDate <= :to")
    Page<Expense> findAllWithFilters(
            @Param("gymId") UUID gymId,
            @Param("branchId") UUID branchId,
            @Param("categoryId") UUID categoryId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.amountLkr), 0) FROM Expense e "
         + "WHERE e.gymId = :gymId AND e.expenseDate BETWEEN :from AND :to")
    Long sumByGymIdAndExpenseDateBetween(
            @Param("gymId") UUID gymId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT e.categoryId, COALESCE(SUM(e.amountLkr), 0), COUNT(e) FROM Expense e "
         + "WHERE e.gymId = :gymId AND e.expenseDate BETWEEN :from AND :to "
         + "GROUP BY e.categoryId")
    List<Object[]> getExpensesByCategory(
            @Param("gymId") UUID gymId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    Optional<Expense> findByIdAndGymId(UUID id, UUID gymId);
}
