package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @GetMapping("/{equipmentId}")
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<List<InspectionDTO>>> getByEquipment(@PathVariable String equipmentId) {
        return ResponseEntity.ok(ApiResponse.ok(inspectionService.getByEquipment(equipmentId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('GYM_OWNER','MANAGER','TRAINER')")
    public ResponseEntity<ApiResponse<InspectionDTO>> create(@Valid @RequestBody CreateInspectionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(inspectionService.create(req)));
    }
}
