package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.enums.FoodCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FoodItemRepository extends JpaRepository<FoodItem, UUID> {

    @Query("""
        SELECT f FROM FoodItem f
        WHERE (f.gymId = :gymId OR f.gymId IS NULL)
          AND (:category IS NULL OR f.category = :category)
          AND (:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY CASE WHEN f.gymId = :gymId THEN 0 ELSE 1 END, f.name ASC
        """)
    Page<FoodItem> findAllWithFilters(
        @Param("gymId") UUID gymId,
        @Param("category") FoodCategory category,
        @Param("search") String search,
        Pageable pageable);

    @Query("SELECT f FROM FoodItem f WHERE (f.gymId = :gymId OR f.gymId IS NULL) AND f.id = :id")
    Optional<FoodItem> findByIdAndGymId(@Param("id") UUID id, @Param("gymId") UUID gymId);

    @Query("SELECT f FROM FoodItem f WHERE f.gymId IS NULL ORDER BY f.name ASC")
    List<FoodItem> findGlobalFoodItems();

    List<FoodItem> findByGymIdAndCustomTrue(UUID gymId);

    @Query("""
        SELECT f FROM FoodItem f
        WHERE (f.gymId = :gymId OR f.gymId IS NULL)
          AND LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))
        ORDER BY CASE WHEN f.gymId = :gymId THEN 0 ELSE 1 END, f.name ASC
        """)
    List<FoodItem> searchByName(@Param("gymId") UUID gymId, @Param("name") String name, Pageable pageable);
}
