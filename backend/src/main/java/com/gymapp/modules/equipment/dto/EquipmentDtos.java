package com.gymapp.modules.equipment.dto;

import com.gymapp.modules.equipment.enums.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class EquipmentDtos {

    // ── Request DTOs ──────────────────────────────────────────────────────────

    public record CreateCategoryRequest(
        @NotBlank @Size(max = 50) String name,
        String icon,
        String color
    ) {}

    public record CreateEquipmentRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        String brand,
        String model,
        @NotBlank String categoryId,
        String serialNumber,
        String assetTag,
        @NotBlank String location,
        @NotNull @Min(1) Integer quantity,
        LocalDate purchaseDate,
        Long purchasePriceLkr,
        LocalDate warrantyExpiry,
        EquipmentStatus status,
        EquipmentCondition condition,
        LocalDate lastServiceDate,
        LocalDate nextServiceDate,
        Integer serviceIntervalDays,
        String branchId,
        String imageUrl,
        String notes
    ) {}

    public record UpdateEquipmentRequest(
        String name,
        String description,
        String brand,
        String model,
        String categoryId,
        String serialNumber,
        String assetTag,
        String location,
        Integer quantity,
        LocalDate purchaseDate,
        Long purchasePriceLkr,
        LocalDate warrantyExpiry,
        EquipmentStatus status,
        EquipmentCondition condition,
        LocalDate lastServiceDate,
        LocalDate nextServiceDate,
        Integer serviceIntervalDays,
        String branchId,
        String imageUrl,
        String notes
    ) {}

    public record UpdateEquipmentStatusRequest(
        @NotNull EquipmentStatus status,
        EquipmentCondition condition,
        String notes
    ) {}

    public record CreateMaintenanceRequest(
        @NotBlank String equipmentId,
        @NotBlank @Size(max = 100) String title,
        @NotBlank String description,
        @NotNull MaintenancePriority priority,
        String assignedTo,
        String assignedToName,
        Long estimatedCostLkr,
        LocalDate dueDate
    ) {}

    public record UpdateMaintenanceRequest(
        String title,
        String description,
        MaintenancePriority priority,
        String assignedTo,
        String assignedToName,
        Long estimatedCostLkr,
        LocalDate dueDate
    ) {}

    public record UpdateMaintenanceStatusRequest(
        @NotNull MaintenanceStatus status,
        String comment,
        Long actualCostLkr,
        String resolutionNotes
    ) {}

    public record AddMaintenanceCommentRequest(
        @NotBlank String comment,
        Long costLkr
    ) {}

    public record CreateServiceScheduleRequest(
        @NotBlank String equipmentId,
        @NotNull ServiceType serviceType,
        @NotNull @Min(1) Integer frequencyDays,
        @NotNull LocalDate nextServiceDate,
        String assignedTo,
        String serviceProvider,
        Long estimatedCostLkr,
        String notes
    ) {}

    public record CreateServiceRecordRequest(
        @NotBlank String equipmentId,
        String scheduleId,
        @NotNull ServiceType serviceType,
        @NotNull LocalDate serviceDate,
        String performedBy,
        String serviceProvider,
        Long costLkr,
        BigDecimal durationHours,
        String conditionBefore,
        String conditionAfter,
        List<String> partsReplaced,
        @NotBlank String description,
        String notes,
        LocalDate nextServiceDate,
        String invoiceUrl
    ) {}

    public record CreateInspectionRequest(
        @NotBlank String equipmentId,
        @NotNull LocalDate inspectionDate,
        @NotNull @Min(1) @Max(5) Integer overallRating,
        @NotNull Boolean isOperational,
        String issuesFound,
        String actionsRequired,
        LocalDate nextInspectionDate,
        List<String> photosUrls
    ) {}

    // ── Response DTOs ─────────────────────────────────────────────────────────

    public record EquipmentCategoryDTO(
        UUID id,
        UUID gymId,
        String name,
        String icon,
        String color,
        long equipmentCount
    ) {}

    public record EquipmentDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        UUID categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        String name,
        String description,
        String brand,
        String model,
        String serialNumber,
        String assetTag,
        String location,
        Integer quantity,
        LocalDate purchaseDate,
        Long purchasePriceLkr,
        LocalDate warrantyExpiry,
        boolean isWarrantyExpired,
        EquipmentStatus status,
        String statusColor,
        EquipmentCondition condition,
        String conditionColor,
        LocalDate lastServiceDate,
        LocalDate nextServiceDate,
        Integer serviceIntervalDays,
        boolean isServiceOverdue,
        long daysUntilService,
        String imageUrl,
        String qrCode,
        String notes,
        long openRequestsCount,
        Long totalMaintenanceCostLkr,
        LocalDateTime createdAt
    ) {}

    public record EquipmentDetailDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        UUID categoryId,
        String categoryName,
        String categoryColor,
        String categoryIcon,
        String name,
        String description,
        String brand,
        String model,
        String serialNumber,
        String assetTag,
        String location,
        Integer quantity,
        LocalDate purchaseDate,
        Long purchasePriceLkr,
        LocalDate warrantyExpiry,
        boolean isWarrantyExpired,
        EquipmentStatus status,
        String statusColor,
        EquipmentCondition condition,
        String conditionColor,
        LocalDate lastServiceDate,
        LocalDate nextServiceDate,
        Integer serviceIntervalDays,
        boolean isServiceOverdue,
        long daysUntilService,
        String imageUrl,
        String qrCode,
        String notes,
        long openRequestsCount,
        Long totalMaintenanceCostLkr,
        LocalDateTime createdAt,
        List<ServiceScheduleDTO> serviceSchedules,
        List<ServiceRecordDTO> recentServiceRecords,
        InspectionDTO latestInspection,
        List<MaintenanceRequestDTO> openRequests
    ) {}

    public record MaintenanceRequestDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        UUID equipmentId,
        String equipmentName,
        String equipmentLocation,
        String requestNumber,
        String title,
        String description,
        MaintenancePriority priority,
        String priorityColor,
        MaintenanceStatus status,
        String reportedBy,
        String reportedByName,
        String assignedTo,
        String assignedToName,
        Long estimatedCostLkr,
        Long actualCostLkr,
        LocalDate dueDate,
        LocalDateTime startedAt,
        LocalDateTime resolvedAt,
        String resolutionNotes,
        LocalDateTime createdAt,
        boolean isOverdue,
        int logCount
    ) {}

    public record MaintenanceRequestDetailDTO(
        UUID id,
        UUID gymId,
        UUID branchId,
        UUID equipmentId,
        String equipmentName,
        String equipmentLocation,
        String requestNumber,
        String title,
        String description,
        MaintenancePriority priority,
        String priorityColor,
        MaintenanceStatus status,
        String reportedBy,
        String reportedByName,
        String assignedTo,
        String assignedToName,
        Long estimatedCostLkr,
        Long actualCostLkr,
        LocalDate dueDate,
        LocalDateTime startedAt,
        LocalDateTime resolvedAt,
        String resolutionNotes,
        LocalDateTime createdAt,
        boolean isOverdue,
        List<MaintenanceLogDTO> logs,
        EquipmentDTO equipment
    ) {}

    public record MaintenanceLogDTO(
        UUID id,
        UUID requestId,
        String loggedBy,
        String loggedByName,
        MaintenanceLogAction action,
        String oldStatus,
        String newStatus,
        String comment,
        Long costLkr,
        LocalDateTime createdAt
    ) {}

    public record ServiceScheduleDTO(
        UUID id,
        UUID gymId,
        UUID equipmentId,
        String equipmentName,
        ServiceType serviceType,
        Integer frequencyDays,
        LocalDate lastServiceDate,
        LocalDate nextServiceDate,
        long daysUntilService,
        boolean isOverdue,
        String assignedTo,
        String serviceProvider,
        Long estimatedCostLkr,
        String notes,
        Boolean isActive
    ) {}

    public record ServiceRecordDTO(
        UUID id,
        UUID gymId,
        UUID equipmentId,
        String equipmentName,
        UUID scheduleId,
        ServiceType serviceType,
        LocalDate serviceDate,
        String performedBy,
        String serviceProvider,
        Long costLkr,
        BigDecimal durationHours,
        String conditionBefore,
        String conditionAfter,
        List<String> partsReplaced,
        String description,
        String notes,
        LocalDate nextServiceDate,
        String invoiceUrl,
        LocalDateTime createdAt
    ) {}

    public record InspectionDTO(
        UUID id,
        UUID gymId,
        UUID equipmentId,
        String equipmentName,
        String inspectedBy,
        String inspectedByName,
        LocalDate inspectionDate,
        Integer overallRating,
        Boolean isOperational,
        String issuesFound,
        String actionsRequired,
        LocalDate nextInspectionDate,
        List<String> photosUrls,
        LocalDateTime createdAt
    ) {}

    public record EquipmentStatsDTO(
        long totalEquipment,
        long operationalCount,
        long maintenanceCount,
        long outOfOrderCount,
        long retiredCount,
        long underInspectionCount,
        long serviceOverdueCount,
        long openRequestsCount,
        long criticalRequestsCount,
        Long totalMaintenanceCostThisMonth,
        long upcomingServicesThisWeek,
        Long equipmentValueLkr
    ) {}

    public record MaintenanceSummaryDTO(
        long openRequests,
        long inProgressRequests,
        long resolvedThisMonth,
        long criticalOpen,
        Double avgResolutionDays,
        Long totalCostThisMonth,
        List<EquipmentCostDTO> costByEquipment,
        Map<String, Long> requestsByPriority
    ) {}

    public record EquipmentCostDTO(
        UUID equipmentId,
        String equipmentName,
        Long totalCostLkr,
        long serviceCount
    ) {}
}
