package com.gymapp.modules.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, UUID> {

    List<ExpenseCategory> findAllByGymId(UUID gymId);

    boolean existsByGymIdAndName(UUID gymId, String name);
}
