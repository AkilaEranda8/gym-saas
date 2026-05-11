package com.gymapp.modules.billing;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "expenses")
@SQLRestriction("deleted_at IS NULL")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "gym_id", nullable = false)
    private UUID gymId;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "amount_lkr", nullable = false)
    private Long amountLkr;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "receipt_url", length = 255)
    private String receiptUrl;

    @Column(name = "paid_by", length = 100)
    private String paidBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
