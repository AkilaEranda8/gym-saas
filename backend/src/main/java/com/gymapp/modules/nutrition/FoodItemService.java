package com.gymapp.modules.nutrition;

import com.gymapp.modules.nutrition.dto.NutritionDtos.*;
import com.gymapp.modules.nutrition.enums.FoodCategory;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final NutritionMapper mapper;

    public PageResponse<FoodItemDTO> listFoodItems(FoodCategory category, String search, int page, int size) {
        UUID gymId = TenantContext.getGymId();
        var pg = foodItemRepository.findAllWithFilters(gymId, category, search, PageRequest.of(page, size));
        return PageResponse.from(pg.map(mapper::toFoodItemDTO));
    }

    public List<FoodItemDTO> searchFoodItems(String name) {
        UUID gymId = TenantContext.getGymId();
        return foodItemRepository.searchByName(gymId, name, PageRequest.of(0, 20))
            .stream().map(mapper::toFoodItemDTO).toList();
    }

    public FoodItemDTO getFoodItem(UUID id) {
        UUID gymId = TenantContext.getGymId();
        FoodItem item = foodItemRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Food item not found"));
        return mapper.toFoodItemDTO(item);
    }

    @Transactional
    public FoodItemDTO createFoodItem(CreateFoodItemRequest req) {
        UUID gymId = TenantContext.getGymId();
        FoodItem item = new FoodItem();
        item.setGymId(gymId);
        item.setName(req.name());
        item.setBrand(req.brand());
        item.setCategory(req.category());
        item.setServingSizeG(req.servingSizeG());
        item.setServingUnit(req.servingUnit() != null ? req.servingUnit() : "g");
        item.setCaloriesPer100g(req.caloriesPer100g());
        item.setProteinPer100g(req.proteinPer100g());
        item.setCarbsPer100g(req.carbsPer100g());
        item.setFatPer100g(req.fatPer100g());
        item.setFiberPer100g(req.fiberPer100g() != null ? req.fiberPer100g() : java.math.BigDecimal.ZERO);
        item.setSugarPer100g(req.sugarPer100g() != null ? req.sugarPer100g() : java.math.BigDecimal.ZERO);
        item.setSodiumPer100g(req.sodiumPer100g() != null ? req.sodiumPer100g() : java.math.BigDecimal.ZERO);
        item.setCustom(true);
        item.setVerified(false);
        return mapper.toFoodItemDTO(foodItemRepository.save(item));
    }

    @Transactional
    public FoodItemDTO updateFoodItem(UUID id, CreateFoodItemRequest req) {
        UUID gymId = TenantContext.getGymId();
        FoodItem item = foodItemRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Food item not found"));
        if (!item.isCustom()) throw new IllegalStateException("Cannot edit a global food item");
        item.setName(req.name());
        item.setBrand(req.brand());
        item.setCategory(req.category());
        item.setServingSizeG(req.servingSizeG());
        if (req.servingUnit() != null) item.setServingUnit(req.servingUnit());
        item.setCaloriesPer100g(req.caloriesPer100g());
        item.setProteinPer100g(req.proteinPer100g());
        item.setCarbsPer100g(req.carbsPer100g());
        item.setFatPer100g(req.fatPer100g());
        if (req.fiberPer100g()  != null) item.setFiberPer100g(req.fiberPer100g());
        if (req.sugarPer100g()  != null) item.setSugarPer100g(req.sugarPer100g());
        if (req.sodiumPer100g() != null) item.setSodiumPer100g(req.sodiumPer100g());
        item.setUpdatedAt(LocalDateTime.now());
        return mapper.toFoodItemDTO(foodItemRepository.save(item));
    }

    @Transactional
    public void deleteFoodItem(UUID id) {
        UUID gymId = TenantContext.getGymId();
        FoodItem item = foodItemRepository.findByIdAndGymId(id, gymId)
            .orElseThrow(() -> new NoSuchElementException("Food item not found"));
        if (!item.isCustom()) throw new IllegalStateException("Cannot delete a global food item");
        item.setDeletedAt(LocalDateTime.now());
        foodItemRepository.save(item);
    }
}
