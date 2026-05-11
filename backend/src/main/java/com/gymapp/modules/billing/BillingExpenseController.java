package com.gymapp.modules.billing;

import com.gymapp.modules.billing.dto.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing/expenses")
@RequiredArgsConstructor
public class BillingExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ExpenseDTO>> create(
            @Valid @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.status(201).body(ApiResponse.created(expenseService.createExpense(req)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<ExpenseDTO>>> list(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.list(categoryId, from, to, pageable)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ExpenseSummaryDTO>> summary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getSummary(from, to)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        expenseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Expense deleted", null));
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER', 'TRAINER')")
    public ResponseEntity<ApiResponse<List<ExpenseCategoryDTO>>> listCategories() {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.listCategories()));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('GYM_OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ExpenseCategoryDTO>> createCategory(
            @Valid @RequestBody CreateExpenseCategoryRequest req) {
        return ResponseEntity.status(201).body(ApiResponse.created(expenseService.createCategory(req)));
    }
}
