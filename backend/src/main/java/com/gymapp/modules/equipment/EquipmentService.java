package com.gymapp.modules.equipment;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.gymapp.modules.equipment.dto.EquipmentDtos.*;
import com.gymapp.modules.equipment.enums.EquipmentCondition;
import com.gymapp.modules.equipment.enums.EquipmentStatus;
import com.gymapp.modules.notification.NotificationService;
import com.gymapp.modules.notification.enums.NotificationType;
import com.gymapp.multitenancy.TenantContext;
import com.gymapp.shared.CurrentUser;
import com.gymapp.shared.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository         equipmentRepository;
    private final EquipmentCategoryRepository categoryRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final ServiceScheduleRepository   scheduleRepository;
    private final ServiceRecordRepository     serviceRecordRepository;
    private final EquipmentInspectionRepository inspectionRepository;
    private final NotificationService         notificationService;
    private final CurrentUser                 currentUser;

    public PageResponse<EquipmentDTO> getAll(int page, int size, String categoryId,
                                              EquipmentStatus status, String branchId, String search) {
        UUID gymId = TenantContext.getGymId();
        UUID catUUID    = categoryId != null ? UUID.fromString(categoryId) : null;
        UUID branchUUID = branchId   != null ? UUID.fromString(branchId)   : null;
        var pg = equipmentRepository.findAllByGymIdWithFilters(
            gymId, catUUID, status, branchUUID, search,
            PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.from(pg.map(e -> toDTO(e, gymId)));
    }

    public EquipmentDetailDTO getById(String id) {
        UUID gymId = TenantContext.getGymId();
        Equipment e = equipmentRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));
        return toDetailDTO(e, gymId);
    }

    public EquipmentDTO getByQrCode(String qrCode) {
        UUID gymId = TenantContext.getGymId();
        Equipment e = equipmentRepository.findByQrCodeAndGymId(qrCode, gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found for QR code"));
        return toDTO(e, gymId);
    }

    @Transactional
    public EquipmentDTO create(CreateEquipmentRequest req) {
        UUID gymId = TenantContext.getGymId();

        if (req.serialNumber() != null && !req.serialNumber().isBlank()) {
            equipmentRepository.findBySerialNumberAndGymId(req.serialNumber(), gymId)
                .ifPresent(x -> { throw new IllegalArgumentException("Serial number already exists"); });
        }

        Equipment e = new Equipment();
        e.setGymId(gymId);
        applyRequest(e, req);

        Equipment saved = equipmentRepository.save(e);

        String qrData = "GYMEQUIP:" + saved.getId() + ":" + gymId;
        saved.setQrCode(qrData);
        saved = equipmentRepository.save(saved);

        if (saved.getNextServiceDate() == null) {
            int interval = req.serviceIntervalDays() != null ? req.serviceIntervalDays() : 90;
            LocalDate base = req.lastServiceDate() != null ? req.lastServiceDate() : LocalDate.now();
            saved.setNextServiceDate(base.plusDays(interval));
            saved = equipmentRepository.save(saved);
        }

        ServiceSchedule schedule = new ServiceSchedule();
        schedule.setGymId(gymId);
        schedule.setEquipmentId(saved.getId());
        schedule.setServiceType(com.gymapp.modules.equipment.enums.ServiceType.ROUTINE);
        schedule.setFrequencyDays(saved.getServiceIntervalDays() != null ? saved.getServiceIntervalDays() : 90);
        schedule.setNextServiceDate(saved.getNextServiceDate());
        schedule.setLastServiceDate(saved.getLastServiceDate());
        schedule.setIsActive(true);
        scheduleRepository.save(schedule);

        return toDTO(saved, gymId);
    }

    @Transactional
    public EquipmentDTO update(String id, UpdateEquipmentRequest req) {
        UUID gymId = TenantContext.getGymId();
        Equipment e = equipmentRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));

        if (req.name()        != null) e.setName(req.name());
        if (req.description() != null) e.setDescription(req.description());
        if (req.brand()       != null) e.setBrand(req.brand());
        if (req.model()       != null) e.setModel(req.model());
        if (req.categoryId()  != null) e.setCategoryId(UUID.fromString(req.categoryId()));
        if (req.serialNumber()!= null) e.setSerialNumber(req.serialNumber());
        if (req.assetTag()    != null) e.setAssetTag(req.assetTag());
        if (req.location()    != null) e.setLocation(req.location());
        if (req.quantity()    != null) e.setQuantity(req.quantity());
        if (req.purchaseDate()!= null) e.setPurchaseDate(req.purchaseDate());
        if (req.purchasePriceLkr() != null) e.setPurchasePriceLkr(req.purchasePriceLkr());
        if (req.warrantyExpiry()   != null) e.setWarrantyExpiry(req.warrantyExpiry());
        if (req.status()      != null) e.setStatus(req.status());
        if (req.condition()   != null) e.setCondition(req.condition());
        if (req.imageUrl()    != null) e.setImageUrl(req.imageUrl());
        if (req.notes()       != null) e.setNotes(req.notes());
        if (req.branchId()    != null) e.setBranchId(UUID.fromString(req.branchId()));

        boolean intervalChanged = req.serviceIntervalDays() != null
            && !req.serviceIntervalDays().equals(e.getServiceIntervalDays());

        if (req.lastServiceDate()    != null) e.setLastServiceDate(req.lastServiceDate());
        if (req.nextServiceDate()    != null) e.setNextServiceDate(req.nextServiceDate());
        if (req.serviceIntervalDays()!= null) e.setServiceIntervalDays(req.serviceIntervalDays());

        if (intervalChanged && req.nextServiceDate() == null) {
            LocalDate base = e.getLastServiceDate() != null ? e.getLastServiceDate() : LocalDate.now();
            e.setNextServiceDate(base.plusDays(e.getServiceIntervalDays()));
        }

        return toDTO(equipmentRepository.save(e), gymId);
    }

    @Transactional
    public EquipmentDTO updateStatus(String id, UpdateEquipmentStatusRequest req) {
        UUID gymId = TenantContext.getGymId();
        Equipment e = equipmentRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));

        EquipmentStatus prev = e.getStatus();
        e.setStatus(req.status());
        if (req.condition() != null) e.setCondition(req.condition());
        Equipment saved = equipmentRepository.save(e);

        if (req.status() == EquipmentStatus.OUT_OF_ORDER) {
            try {
                notificationService.broadcastToGym(gymId,
                    "❌ Equipment Out of Order: " + e.getName(),
                    e.getName() + " at " + e.getLocation() + " is now OUT OF ORDER. Maintenance team alerted.",
                    NotificationType.MAINTENANCE_ALERT);
            } catch (Exception ex) { log.warn("Notify failed: {}", ex.getMessage()); }
        }

        return toDTO(saved, gymId);
    }

    @Transactional
    public void delete(String id) {
        UUID gymId = TenantContext.getGymId();
        Equipment e = equipmentRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));

        long openCount = maintenanceRepository.countOpenByEquipmentId(e.getId());
        if (openCount > 0) throw new IllegalStateException("Equipment has open maintenance requests");

        scheduleRepository.findAllByEquipmentIdAndIsActiveTrue(e.getId())
            .forEach(s -> { s.setIsActive(false); scheduleRepository.save(s); });

        equipmentRepository.softDelete(e.getId(), gymId, LocalDateTime.now());
    }

    public EquipmentStatsDTO getStats() {
        UUID gymId = TenantContext.getGymId();
        LocalDate today = LocalDate.now();
        return new EquipmentStatsDTO(
            equipmentRepository.countByGymIdAndDeletedAtIsNull(gymId),
            equipmentRepository.countByGymIdAndStatus(gymId, EquipmentStatus.OPERATIONAL),
            equipmentRepository.countByGymIdAndStatus(gymId, EquipmentStatus.MAINTENANCE),
            equipmentRepository.countByGymIdAndStatus(gymId, EquipmentStatus.OUT_OF_ORDER),
            equipmentRepository.countByGymIdAndStatus(gymId, EquipmentStatus.RETIRED),
            equipmentRepository.countByGymIdAndStatus(gymId, EquipmentStatus.UNDER_INSPECTION),
            equipmentRepository.findServiceOverdue(gymId, today).size(),
            maintenanceRepository.countByGymIdAndStatus(gymId, com.gymapp.modules.equipment.enums.MaintenanceStatus.OPEN)
            + maintenanceRepository.countByGymIdAndStatus(gymId, com.gymapp.modules.equipment.enums.MaintenanceStatus.IN_PROGRESS),
            maintenanceRepository.countByGymIdAndPriority(gymId, com.gymapp.modules.equipment.enums.MaintenancePriority.CRITICAL),
            maintenanceRepository.sumCostByGymIdAndResolvedAtBetween(gymId,
                today.withDayOfMonth(1).atStartOfDay(), today.plusDays(1).atStartOfDay()),
            scheduleRepository.findAllByGymIdAndNextServiceDateBetween(gymId, today, today.plusDays(7)).size(),
            null
        );
    }

    public List<EquipmentDTO> getServiceDueSoon(int days) {
        UUID gymId = TenantContext.getGymId();
        LocalDate today = LocalDate.now();
        return equipmentRepository.findServiceDueSoon(gymId, today, today.plusDays(days))
            .stream().map(e -> toDTO(e, gymId))
            .sorted(Comparator.comparing(EquipmentDTO::nextServiceDate, Comparator.nullsLast(Comparator.naturalOrder())))
            .toList();
    }

    public List<EquipmentDTO> getServiceOverdue() {
        UUID gymId = TenantContext.getGymId();
        return equipmentRepository.findServiceOverdue(gymId, LocalDate.now())
            .stream().map(e -> toDTO(e, gymId)).toList();
    }

    public byte[] generateQrCode(String id) {
        UUID gymId = TenantContext.getGymId();
        Equipment e = equipmentRepository.findByIdAndGymId(UUID.fromString(id), gymId)
            .orElseThrow(() -> new NoSuchElementException("Equipment not found"));
        try {
            String data = e.getQrCode() != null ? e.getQrCode() : "GYMEQUIP:" + e.getId() + ":" + gymId;
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(data, BarcodeFormat.QR_CODE, 300, 300,
                Map.of(EncodeHintType.MARGIN, 2));
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
            return baos.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate QR code", ex);
        }
    }

    private void applyRequest(Equipment e, CreateEquipmentRequest req) {
        e.setName(req.name());
        e.setDescription(req.description());
        e.setBrand(req.brand());
        e.setModel(req.model());
        if (req.categoryId() != null) e.setCategoryId(UUID.fromString(req.categoryId()));
        e.setSerialNumber(req.serialNumber());
        e.setAssetTag(req.assetTag());
        e.setLocation(req.location());
        e.setQuantity(req.quantity() != null ? req.quantity() : 1);
        e.setPurchaseDate(req.purchaseDate());
        e.setPurchasePriceLkr(req.purchasePriceLkr());
        e.setWarrantyExpiry(req.warrantyExpiry());
        e.setStatus(req.status() != null ? req.status() : EquipmentStatus.OPERATIONAL);
        e.setCondition(req.condition() != null ? req.condition() : EquipmentCondition.GOOD);
        e.setLastServiceDate(req.lastServiceDate());
        e.setNextServiceDate(req.nextServiceDate());
        e.setServiceIntervalDays(req.serviceIntervalDays() != null ? req.serviceIntervalDays() : 90);
        if (req.branchId() != null) e.setBranchId(UUID.fromString(req.branchId()));
        e.setImageUrl(req.imageUrl());
        e.setNotes(req.notes());
    }

    public EquipmentDTO toDTO(Equipment e, UUID gymId) {
        String catName  = null, catColor = null, catIcon = null;
        if (e.getCategory() != null) {
            catName  = e.getCategory().getName();
            catColor = e.getCategory().getColor();
            catIcon  = e.getCategory().getIcon();
        }
        long openCount  = maintenanceRepository.countOpenByEquipmentId(e.getId());
        Long totalCost  = serviceRecordRepository.sumCostByEquipmentId(e.getId());
        return new EquipmentDTO(
            e.getId(), e.getGymId(), e.getBranchId(), e.getCategoryId(),
            catName, catColor, catIcon,
            e.getName(), e.getDescription(), e.getBrand(), e.getModel(),
            e.getSerialNumber(), e.getAssetTag(), e.getLocation(), e.getQuantity(),
            e.getPurchaseDate(), e.getPurchasePriceLkr(), e.getWarrantyExpiry(), e.isWarrantyExpired(),
            e.getStatus(), e.getStatus() != null ? e.getStatus().getColor() : null,
            e.getCondition(), e.getCondition() != null ? e.getCondition().getColor() : null,
            e.getLastServiceDate(), e.getNextServiceDate(), e.getServiceIntervalDays(),
            e.isServiceOverdue(), e.getDaysUntilService(),
            e.getImageUrl(), e.getQrCode(), e.getNotes(),
            openCount, totalCost, e.getCreatedAt()
        );
    }

    private EquipmentDetailDTO toDetailDTO(Equipment e, UUID gymId) {
        EquipmentDTO base = toDTO(e, gymId);
        List<ServiceScheduleDTO> schedules = scheduleRepository.findActiveByEquipmentIdOrderByDate(e.getId())
            .stream().map(s -> toScheduleDTO(s, e.getName())).toList();
        List<ServiceRecordDTO> recentRecords = serviceRecordRepository.findTop5ByEquipmentIdOrderByServiceDateDesc(e.getId())
            .stream().map(r -> toRecordDTO(r, e.getName())).toList();
        EquipmentInspection latestInsp = inspectionRepository.findLatestByEquipmentId(e.getId()).orElse(null);
        List<MaintenanceRequestDTO> openRequests = maintenanceRepository.findOpenByEquipmentId(e.getId())
            .stream().map(r -> toMaintenanceDTO(r, e.getName(), e.getLocation())).toList();
        return new EquipmentDetailDTO(
            base.id(), base.gymId(), base.branchId(), base.categoryId(),
            base.categoryName(), base.categoryColor(), base.categoryIcon(),
            base.name(), base.description(), base.brand(), base.model(),
            base.serialNumber(), base.assetTag(), base.location(), base.quantity(),
            base.purchaseDate(), base.purchasePriceLkr(), base.warrantyExpiry(), base.isWarrantyExpired(),
            base.status(), base.statusColor(), base.condition(), base.conditionColor(),
            base.lastServiceDate(), base.nextServiceDate(), base.serviceIntervalDays(),
            base.isServiceOverdue(), base.daysUntilService(),
            base.imageUrl(), base.qrCode(), base.notes(),
            base.openRequestsCount(), base.totalMaintenanceCostLkr(), base.createdAt(),
            schedules, recentRecords,
            latestInsp != null ? toInspectionDTO(latestInsp, e.getName()) : null,
            openRequests
        );
    }

    public MaintenanceRequestDTO toMaintenanceDTO(MaintenanceRequest r, String equipName, String equipLocation) {
        return new MaintenanceRequestDTO(
            r.getId(), r.getGymId(), r.getBranchId(), r.getEquipmentId(),
            equipName, equipLocation,
            r.getRequestNumber(), r.getTitle(), r.getDescription(),
            r.getPriority(), r.getPriority() != null ? r.getPriority().getColor() : null,
            r.getStatus(), r.getReportedBy(), r.getReportedByName(),
            r.getAssignedTo(), r.getAssignedToName(),
            r.getEstimatedCostLkr(), r.getActualCostLkr(),
            r.getDueDate(), r.getStartedAt(), r.getResolvedAt(),
            r.getResolutionNotes(), r.getCreatedAt(),
            r.isOverdue(), r.getLogs() != null ? r.getLogs().size() : 0
        );
    }

    public ServiceScheduleDTO toScheduleDTO(ServiceSchedule s, String equipName) {
        return new ServiceScheduleDTO(
            s.getId(), s.getGymId(), s.getEquipmentId(), equipName,
            s.getServiceType(), s.getFrequencyDays(),
            s.getLastServiceDate(), s.getNextServiceDate(),
            s.getDaysUntilService(), s.isOverdue(),
            s.getAssignedTo(), s.getServiceProvider(),
            s.getEstimatedCostLkr(), s.getNotes(), s.getIsActive()
        );
    }

    public ServiceRecordDTO toRecordDTO(ServiceRecord r, String equipName) {
        List<String> parts = r.getPartsReplaced() != null && !r.getPartsReplaced().isBlank()
            ? Arrays.asList(r.getPartsReplaced().split(","))
            : List.of();
        return new ServiceRecordDTO(
            r.getId(), r.getGymId(), r.getEquipmentId(), equipName,
            r.getScheduleId(), r.getServiceType(), r.getServiceDate(),
            r.getPerformedBy(), r.getServiceProvider(), r.getCostLkr(),
            r.getDurationHours(), r.getConditionBefore(), r.getConditionAfter(),
            parts, r.getDescription(), r.getNotes(),
            r.getNextServiceDate(), r.getInvoiceUrl(), r.getCreatedAt()
        );
    }

    public InspectionDTO toInspectionDTO(EquipmentInspection i, String equipName) {
        List<String> photos = i.getPhotosUrls() != null && !i.getPhotosUrls().isBlank()
            ? Arrays.asList(i.getPhotosUrls().split(","))
            : List.of();
        return new InspectionDTO(
            i.getId(), i.getGymId(), i.getEquipmentId(), equipName,
            i.getInspectedBy(), i.getInspectedByName(), i.getInspectionDate(),
            i.getOverallRating(), i.getIsOperational(),
            i.getIssuesFound(), i.getActionsRequired(), i.getNextInspectionDate(),
            photos, i.getCreatedAt()
        );
    }
}
