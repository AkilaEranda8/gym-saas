package com.gymapp.modules.shop.repository;

import com.gymapp.modules.shop.entity.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, UUID> {

    List<ProductCategory> findAllByGymIdOrderBySortOrderAsc(UUID gymId);

    List<ProductCategory> findAllByGymIdAndIsActiveTrueOrderBySortOrderAsc(UUID gymId);

    Optional<ProductCategory> findByGymIdAndName(UUID gymId, String name);

    boolean existsByGymIdAndName(UUID gymId, String name);
}
