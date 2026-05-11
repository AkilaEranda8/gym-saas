package com.gymapp.modules.equipment;

import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final EquipmentInspectionRepository inspectionRepository;
    private final EquipmentRepository           equipmentRepository;
    private final EquipmentService              equipmentService;
    private final CurrentUser                   currentUser;

    public List<InspectionDTO> getByEquipment(String equipmentId) {
        return inspectionRepository.findAllByEquipmentIdOrderByInspectionDateDesc(UUID.fromString(equipmentId))
            .stream().map(i -> {
                Equipment eq = equipmentRepository.findById(i.getEquipmentId()).orElse(null);
                return equipmentService.toInspectionDTO(i, eq != null ? eq.getName() : null);
            }).toList();
    }

    @Transactional
    public InspectionDTO create(CreateInspectionRequest req) {
        UUID gymId = TenantContext.getGymId();
        UUID eqId  = UUID.fromString(req.equipmentId());
        Equipment eq = equipmentRepository.findByIdAndGymId(eqId, gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));

        EquipmentInspection i = new EquipmentInspection();
        i.setGymId(gymId);
        i.setEquipmentId(eqId);
        i.setInspectedBy(currentUser.getUserId());
        i.setInspectedByName(currentUser.getEmail());
        i.setInspectionDate(req.inspectionDate());
        i.setOverallRating(req.overallRating());
        i.setIsOperational(req.isOperational());
        i.setIssuesFound(req.issuesFound());
        i.setActionsRequired(req.actionsRequired());
        i.setNextInspectionDate(req.nextInspectionDate());
        if (req.photosUrls() != null && !req.photosUrls().isEmpty()) {
            i.setPhotosUrls(String.join(",", req.photosUrls()));
        }

        EquipmentInspection saved = inspectionRepository.save(i);

        if (!req.isOperational()) {
            eq.setStatus(com.gymapp.modules.equipment.enums.EquipmentStatus.OUT_OF_ORDER);
        } else {
            eq.setStatus(com.gymapp.modules.equipment.enums.EquipmentStatus.OPERATIONAL);
        }
        equipmentRepository.save(eq);

        return equipmentService.toInspectionDTO(saved, eq.getName());
    }
}
