package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepo;
    private final ExpenseCategoryRepository categoryRepo;

    @Transactional
    public ExpenseDTO createExpense(CreateExpenseRequest req) {
        UUID gymId = TenantContext.getGymId();
        Expense e = new Expense();
        e.setGymId(gymId);
        e.setDescription(req.description());
        e.setAmountLkr(req.amountLkr());
        e.setExpenseDate(req.expenseDate());
        e.setReceiptUrl(req.receiptUrl());
        e.setPaidBy(req.paidBy());
        e.setNotes(req.notes());
        if (req.categoryId() != null) e.setCategoryId(UUID.fromString(req.categoryId()));
        if (req.branchId() != null)   e.setBranchId(UUID.fromString(req.branchId()));
        return toDTO(expenseRepo.save(e));
    }

    public Page<ExpenseDTO> list(UUID categoryId, LocalDate from, LocalDate to, Pageable pageable) {
        UUID gymId = TenantContext.getGymId();
        LocalDate effectiveFrom = from != null ? from : LocalDate.of(2000, 1, 1);
        LocalDate effectiveTo   = to   != null ? to   : LocalDate.of(2099, 12, 31);
        return expenseRepo.findAllWithFilters(gymId, null, categoryId, effectiveFrom, effectiveTo, pageable)
                .map(this::toDTO);
    }

    @Transactional
    public void delete(UUID id) {
        UUID gymId = TenantContext.getGymId();
        Expense e = expenseRepo.findByIdAndGymId(id, gymId)
                .orElseThrow(() -> new NoSuchElementException("Expense not found"));
        e.setDeletedAt(LocalDateTime.now());
        expenseRepo.save(e);
    }

    public ExpenseSummaryDTO getSummary(LocalDate from, LocalDate to) {
        UUID gymId = TenantContext.getGymId();
        Long total = expenseRepo.sumByGymIdAndExpenseDateBetween(gymId, from, to);
        if (total == null) total = 0L;

        List<Object[]> byCategory = expenseRepo.getExpensesByCategory(gymId, from, to);
        long finalTotal = total;
        List<ExpenseSummaryDTO.CategoryExpenseDTO> cats = byCategory.stream().map(r -> {
            String catId = r[0] != null ? r[0].toString() : "uncategorized";
            long amount  = ((Number) r[1]).longValue();
            long count   = ((Number) r[2]).longValue();
            return new ExpenseSummaryDTO.CategoryExpenseDTO(catId, catId, null, amount,
                    finalTotal > 0 ? (double) amount / finalTotal * 100 : 0.0);
        }).collect(Collectors.toList());

        return new ExpenseSummaryDTO(total, cats, List.of());
    }

    public List<ExpenseCategoryDTO> listCategories() {
        return categoryRepo.findAllByGymId(TenantContext.getGymId()).stream()
                .map(c -> new ExpenseCategoryDTO(c.getId(), c.getGymId(), c.getName(), c.getColor()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseCategoryDTO createCategory(CreateExpenseCategoryRequest req) {
        UUID gymId = TenantContext.getGymId();
        ExpenseCategory cat = new ExpenseCategory();
        cat.setGymId(gymId);
        cat.setName(req.name());
        cat.setColor(req.color());
        cat = categoryRepo.save(cat);
        return new ExpenseCategoryDTO(cat.getId(), cat.getGymId(), cat.getName(), cat.getColor());
    }

    private ExpenseDTO toDTO(Expense e) {
        return new ExpenseDTO(e.getId(), e.getGymId(), e.getBranchId(), e.getCategoryId(),
                null, null, e.getDescription(), e.getAmountLkr(), e.getExpenseDate(),
                e.getReceiptUrl(), e.getPaidBy(), e.getNotes());
    }
}
