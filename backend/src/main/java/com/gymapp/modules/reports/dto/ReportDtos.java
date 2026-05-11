package com.gymapp.modules.reports.dto;

import com.gymapp.modules.reports.enums.ReportFormat;
import com.gymapp.modules.reports.enums.ReportFrequency;
import com.gymapp.modules.reports.enums.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ReportDtos {

    // ── Dashboard KPI ─────────────────────────────────────────────────────────

    public record DashboardKpiDTO(
        String periodLabel,
        LocalDate periodFrom,
        LocalDate periodTo,
        long totalRevenueLkr,
        double revenueGrowthPct,
        long avgRevenuePerMember,
        int totalMembers,
        int activeMembers,
        int newMembersThisPeriod,
        int churnedMembers,
        double memberGrowthPct,
        double retentionRatePct,
        long totalCheckIns,
        double avgDailyCheckIns,
        String peakHour,
        String peakDay,
        int totalClassSessions,
        double avgFillRatePct,
        int totalClassBookings,
        long shopRevenueLkr,
        int shopOrdersCount,
        int openMaintenanceRequests,
        int serviceOverdueCount
    ) {}

    // ── Revenue ───────────────────────────────────────────────────────────────

    public record RevenueReportDTO(
        LocalDate periodFrom,
        LocalDate periodTo,
        long totalRevenueLkr,
        long paidLkr,
        long pendingLkr,
        long refundedLkr,
        long failedLkr,
        long totalTransactions,
        long avgTransactionValueLkr,
        List<RevenueByTypeDTO> revenueByType,
        List<RevenueByMethodDTO> revenueByMethod,
        List<MonthlyRevenueDTO> revenueByMonth,
        List<BranchRevenueDTO> revenueByBranch,
        List<TopMemberDTO> topPayingMembers
    ) {}

    public record RevenueByTypeDTO(
        String paymentType,
        String label,
        long totalLkr,
        long count,
        double percentage
    ) {}

    public record RevenueByMethodDTO(
        String method,
        String label,
        long totalLkr,
        long count,
        double percentage
    ) {}

    public record MonthlyRevenueDTO(
        int month,
        int year,
        String label,
        long revenueLkr,
        long expensesLkr,
        long netProfitLkr,
        long transactionCount,
        double growthPct
    ) {}

    public record BranchRevenueDTO(
        UUID branchId,
        String branchName,
        long revenueLkr,
        long memberCount,
        long revenuePerMember
    ) {}

    public record TopMemberDTO(
        UUID memberId,
        String memberName,
        String memberPhone,
        long totalPaidLkr,
        long transactionCount,
        String plan
    ) {}

    // ── Members ───────────────────────────────────────────────────────────────

    public record MemberReportDTO(
        LocalDate periodFrom,
        LocalDate periodTo,
        long totalMembers,
        long activeMembers,
        long newMembers,
        long churnedMembers,
        long expiringThisWeek,
        long expiredCount,
        long suspendedCount,
        double retentionRatePct,
        double avgMembershipDurationDays,
        List<PlanBreakdownDTO> membersByPlan,
        List<BranchMemberDTO> membersByBranch,
        List<MonthlyGrowthDTO> growthByMonth
    ) {}

    public record PlanBreakdownDTO(
        String plan,
        String label,
        String color,
        long count,
        double percentage,
        long revenueLkr
    ) {}

    public record BranchMemberDTO(
        UUID branchId,
        String branchName,
        long memberCount,
        long activeCount,
        long newThisMonth
    ) {}

    public record MonthlyGrowthDTO(
        int month,
        int year,
        String label,
        long newMembers,
        long churnedMembers,
        long netGrowth,
        long totalMembers
    ) {}

    // ── Attendance ────────────────────────────────────────────────────────────

    public record AttendanceReportDTO(
        LocalDate periodFrom,
        LocalDate periodTo,
        long totalCheckIns,
        long uniqueMembers,
        double avgDailyCheckIns,
        String peakHour,
        String peakDay,
        LocalDate peakDate,
        double avgSessionDurationMinutes,
        Map<Integer, Long> hourlyHeatmap,
        List<DailyAttendanceDTO> dailyAttendance,
        List<BranchAttendanceDTO> attendanceByBranch,
        List<TopAttendeeDTO> topAttendees,
        List<MemberSummaryDTO> leastActiveMembers
    ) {}

    public record DailyAttendanceDTO(
        LocalDate date,
        String dayOfWeek,
        long count,
        boolean isWeekend,
        boolean isSriLankanHoliday
    ) {}

    public record BranchAttendanceDTO(
        UUID branchId,
        String branchName,
        long totalCheckIns,
        double avgDaily
    ) {}

    public record TopAttendeeDTO(
        UUID memberId,
        String memberName,
        long checkInCount,
        int streakDays
    ) {}

    public record MemberSummaryDTO(
        UUID memberId,
        String memberName,
        String memberPhone,
        long checkInCount
    ) {}

    // ── Trainer ───────────────────────────────────────────────────────────────

    public record TrainerPerformanceReportDTO(
        LocalDate periodFrom,
        LocalDate periodTo,
        long totalTrainers,
        long activeTrainers,
        long totalPTSessions,
        long completedSessions,
        long cancelledSessions,
        long noShowSessions,
        double avgSessionsPerTrainer,
        double avgRatingAllTrainers,
        long totalPTRevenueLkr,
        List<TrainerStatDTO> trainerStats
    ) {}

    public record TrainerStatDTO(
        UUID trainerId,
        String trainerName,
        String specialty,
        String employmentType,
        long completedSessions,
        long cancelledSessions,
        long noShowSessions,
        double noShowRatePct,
        long activeClients,
        long newClientsThisPeriod,
        double avgRating,
        long totalReviews,
        long revenueLkr,
        long revenuePerSession,
        long classesHeld,
        double avgClassFillRate
    ) {}

    // ── Classes ───────────────────────────────────────────────────────────────

    public record ClassReportDTO(
        LocalDate periodFrom,
        LocalDate periodTo,
        long totalSessions,
        long completedSessions,
        long cancelledSessions,
        double cancellationRatePct,
        long totalBookings,
        double avgFillRatePct,
        String mostPopularClass,
        long mostPopularClassBookings,
        String mostActiveTrainer,
        long mostActiveTrainerClasses,
        List<ClassTypeStatDTO> classesByType,
        List<DaySessionStatDTO> sessionsByDay,
        List<WeeklyClassStatDTO> weeklyTrend
    ) {}

    public record ClassTypeStatDTO(
        String classType,
        String label,
        String color,
        long sessionCount,
        long totalBookings,
        double avgFillRatePct,
        long cancellationCount
    ) {}

    public record DaySessionStatDTO(
        String dayOfWeek,
        long sessionCount,
        long bookingCount,
        double avgFillRate
    ) {}

    public record WeeklyClassStatDTO(
        int week,
        int year,
        String label,
        long sessions,
        long bookings,
        double avgFillRate
    ) {}

    // ── Shop ──────────────────────────────────────────────────────────────────

    public record ShopReportDTO(
        LocalDate periodFrom,
        LocalDate periodTo,
        long totalRevenueLkr,
        long totalOrders,
        long avgOrderValueLkr,
        long totalItemsSold,
        long uniqueCustomers,
        List<TopProductStatDTO> topProducts,
        List<CategoryRevenueDTO> revenueByCategory,
        List<DailySaleDTO> dailySales,
        List<LowStockProductDTO> lowStockProducts,
        long outOfStockCount
    ) {}

    public record TopProductStatDTO(
        UUID productId,
        String productName,
        String categoryName,
        int rank,
        long unitsSold,
        long revenueLkr,
        long profitLkr,
        double profitMarginPct
    ) {}

    public record CategoryRevenueDTO(
        String categoryName,
        long revenueLkr,
        long unitsSold,
        double percentage
    ) {}

    public record DailySaleDTO(
        LocalDate date,
        long revenueLkr,
        long orderCount
    ) {}

    public record LowStockProductDTO(
        UUID productId,
        String productName,
        int currentStock,
        int minStock
    ) {}

    // ── Equipment ─────────────────────────────────────────────────────────────

    public record EquipmentReportDTO(
        LocalDate periodFrom,
        LocalDate periodTo,
        long totalEquipment,
        long operationalCount,
        long maintenanceCount,
        long outOfOrderCount,
        long serviceOverdueCount,
        long totalMaintenanceCostLkr,
        double avgResolutionDays,
        long openRequests,
        long criticalRequests,
        List<EquipmentCostDTO> mostMaintainedEquipment,
        List<MonthlyMaintenanceDTO> maintenanceByMonth
    ) {}

    public record EquipmentCostDTO(
        UUID equipmentId,
        String equipmentName,
        long totalCostLkr,
        long requestCount
    ) {}

    public record MonthlyMaintenanceDTO(
        int month,
        int year,
        String label,
        long requestCount,
        long resolvedCount,
        long costLkr,
        double avgResolutionDays
    ) {}

    // ── Lanka Insights ────────────────────────────────────────────────────────

    public record LankaInsightsDTO(
        List<String> peakSeasonMonths,
        List<String> lowSeasonMonths,
        AvuruduImpactDTO avuruduImpact,
        double monsoonBoostPct,
        String paymentPeakDay,
        double paydayUpliftPct,
        double whatsappRenewalRate,
        List<SeasonalTrendDTO> membershipTrends
    ) {}

    public record AvuruduImpactDTO(
        int year,
        double avgAttendanceDrop,
        List<DailyAttendanceDTO> aprilData
    ) {}

    public record SeasonalTrendDTO(
        int month,
        String label,
        double avgAttendance,
        double avgRevenue,
        String seasonTag
    ) {}

    // ── Scheduled Reports ─────────────────────────────────────────────────────

    public record ScheduledReportDTO(
        UUID id,
        UUID gymId,
        String name,
        ReportType reportType,
        ReportFrequency frequency,
        List<String> recipients,
        List<String> whatsappNumbers,
        LocalDateTime lastSentAt,
        LocalDateTime nextSendAt,
        boolean isActive
    ) {}

    public record CreateScheduledReportRequest(
        @NotBlank String name,
        @NotNull ReportType reportType,
        @NotNull ReportFrequency frequency,
        List<String> recipients,
        List<String> whatsappNumbers
    ) {}

    // ── Export ────────────────────────────────────────────────────────────────

    public record ReportExportDTO(
        UUID id,
        ReportType reportType,
        ReportFormat format,
        String fileUrl,
        Long fileSizeBytes,
        LocalDate fromDate,
        LocalDate toDate,
        String generatedBy,
        LocalDateTime generatedAt,
        LocalDateTime expiresAt,
        int downloadCount
    ) {}
}
