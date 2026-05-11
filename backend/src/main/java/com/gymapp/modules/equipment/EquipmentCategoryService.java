package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.multitenancy.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipmentCategoryService {

    private final EquipmentCategoryRepository categoryRepository;

    public List<EquipmentCategoryDTO> getAll() {
        UUID gymId = TenantContext.getGymId();
        return categoryRepository.findAllByGymIdOrderByNameAsc(gymId)
            .stream().map(this::toDTO).toList();
    }

    @Transactional
    public EquipmentCategoryDTO create(CreateCategoryRequest req) {
        UUID gymId = TenantContext.getGymId();
        if (categoryRepository.existsByGymIdAndNameIgnoreCase(gymId, req.name())) {
            throw new IllegalArgumentException("Category already exists: " + req.name());
        }
        EquipmentCategory cat = new EquipmentCategory();
        cat.setGymId(gymId);
        cat.setName(req.name());
        cat.setIcon(req.icon());
        cat.setColor(req.color());
        return toDTO(categoryRepository.save(cat));
    }

    @Transactional
    public EquipmentCategoryDTO update(String id, CreateCategoryRequest req) {
        UUID gymId = TenantContext.getGymId();
        EquipmentCategory cat = categoryRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Category not found"));
        cat.setName(req.name());
        if (req.icon()  != null) cat.setIcon(req.icon());
        if (req.color() != null) cat.setColor(req.color());
        return toDTO(categoryRepository.save(cat));
    }

    @Transactional
    public void delete(String id) {
        UUID gymId = TenantContext.getGymId();
        EquipmentCategory cat = categoryRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Category not found"));
        long count = categoryRepository.countEquipmentByCategory(cat.getId());
        if (count > 0) throw new IllegalStateException("Category has " + count + " equipment item(s)");
        categoryRepository.softDelete(cat.getId(), gymId, LocalDateTime.now());
    }

    private EquipmentCategoryDTO toDTO(EquipmentCategory c) {
        long count = categoryRepository.countEquipmentByCategory(c.getId());
        return new EquipmentCategoryDTO(c.getId(), c.getGymId(), c.getName(), c.getIcon(), c.getColor(), count);
    }
}
