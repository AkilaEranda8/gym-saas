"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Shared helpers ────────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function startOfMonth(): string {
  const d = new Date();
  return fmtDate(new Date(d.getFullYear(), d.getMonth(), 1));
}
function today(): string { return fmtDate(new Date()); }
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmtDate(d);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardKpiDTO {
  periodLabel: string;
  periodFrom: string;
  periodTo: string;
  totalRevenueLkr: number;
  revenueGrowthPct: number;
  avgRevenuePerMember: number;
  totalMembers: number;
  activeMembers: number;
  newMembersThisPeriod: number;
  churnedMembers: number;
  memberGrowthPct: number;
  retentionRatePct: number;
  totalCheckIns: number;
  avgDailyCheckIns: number;
  peakHour: string;
  peakDay: string;
  totalClassSessions: number;
  avgFillRatePct: number;
  totalClassBookings: number;
  shopRevenueLkr: number;
  shopOrdersCount: number;
  openMaintenanceRequests: number;
  serviceOverdueCount: number;
}

export interface RevenueByTypeDTO {
  paymentType: string;
  label: string;
  totalLkr: number;
  count: number;
  percentage: number;
}

export interface MonthlyRevenueDTO {
  month: number;
  year: number;
  label: string;
  revenueLkr: number;
  expensesLkr: number;
  netProfitLkr: number;
  transactionCount: number;
  growthPct: number;
}

export interface RevenueReportDTO {
  periodFrom: string;
  periodTo: string;
  totalRevenueLkr: number;
  paidLkr: number;
  pendingLkr: number;
  refundedLkr: number;
  failedLkr: number;
  totalTransactions: number;
  avgTransactionValueLkr: number;
  revenueByType: RevenueByTypeDTO[];
  revenueByMethod: { method: string; label: string; totalLkr: number; count: number; percentage: number }[];
  revenueByMonth: MonthlyRevenueDTO[];
  revenueByBranch: unknown[];
  topPayingMembers: unknown[];
}

export interface MonthlyGrowthDTO {
  month: number;
  year: number;
  label: string;
  newMembers: number;
  churnedMembers: number;
  netGrowth: number;
  totalMembers: number;
}

export interface MemberReportDTO {
  periodFrom: string;
  periodTo: string;
  totalMembers: number;
  activeMembers: number;
  newMembers: number;
  churnedMembers: number;
  expiringThisWeek: number;
  expiredCount: number;
  suspendedCount: number;
  retentionRatePct: number;
  avgMembershipDurationDays: number;
  membersByPlan: { plan: string; label: string; color: string; count: number; percentage: number; revenueLkr: number }[];
  membersByBranch: unknown[];
  growthByMonth: MonthlyGrowthDTO[];
}

export interface DailyAttendanceDTO {
  date: string;
  dayOfWeek: string;
  count: number;
  isWeekend: boolean;
  isSriLankanHoliday: boolean;
}

export interface AttendanceReportDTO {
  periodFrom: string;
  periodTo: string;
  totalCheckIns: number;
  uniqueMembers: number;
  avgDailyCheckIns: number;
  peakHour: string;
  peakDay: string;
  peakDate: string | null;
  avgSessionDurationMinutes: number;
  hourlyHeatmap: Record<number, number>;
  dailyAttendance: DailyAttendanceDTO[];
  attendanceByBranch: unknown[];
  topAttendees: { memberId: string; memberName: string; checkInCount: number; streakDays: number }[];
  leastActiveMembers: unknown[];
}

export interface TrainerStatDTO {
  trainerId: string;
  trainerName: string;
  specialty: string;
  employmentType: string;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  noShowRatePct: number;
  activeClients: number;
  newClientsThisPeriod: number;
  avgRating: number;
  totalReviews: number;
  revenueLkr: number;
  revenuePerSession: number;
  classesHeld: number;
  avgClassFillRate: number;
}

export interface TrainerPerformanceReportDTO {
  periodFrom: string;
  periodTo: string;
  totalTrainers: number;
  activeTrainers: number;
  totalPTSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  avgSessionsPerTrainer: number;
  avgRatingAllTrainers: number;
  totalPTRevenueLkr: number;
  trainerStats: TrainerStatDTO[];
}

export interface ClassReportDTO {
  periodFrom: string;
  periodTo: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  cancellationRatePct: number;
  totalBookings: number;
  avgFillRatePct: number;
  mostPopularClass: string | null;
  mostPopularClassBookings: number;
  mostActiveTrainer: string | null;
  mostActiveTrainerClasses: number;
  classesByType: { classType: string; label: string; color: string; sessionCount: number; totalBookings: number; avgFillRatePct: number; cancellationCount: number }[];
  sessionsByDay: { dayOfWeek: string; sessionCount: number; bookingCount: number; avgFillRate: number }[];
  weeklyTrend: unknown[];
}

export interface TopProductStatDTO {
  productId: string;
  productName: string;
  categoryName: string;
  rank: number;
  unitsSold: number;
  revenueLkr: number;
  profitLkr: number;
  profitMarginPct: number;
}

export interface ShopReportDTO {
  periodFrom: string;
  periodTo: string;
  totalRevenueLkr: number;
  totalOrders: number;
  avgOrderValueLkr: number;
  totalItemsSold: number;
  uniqueCustomers: number;
  topProducts: TopProductStatDTO[];
  revenueByCategory: { categoryName: string; revenueLkr: number; unitsSold: number; percentage: number }[];
  dailySales: { date: string; revenueLkr: number; orderCount: number }[];
  lowStockProducts: unknown[];
  outOfStockCount: number;
}

export interface EquipmentReportDTO {
  periodFrom: string;
  periodTo: string;
  totalEquipment: number;
  operationalCount: number;
  maintenanceCount: number;
  outOfOrderCount: number;
  serviceOverdueCount: number;
  totalMaintenanceCostLkr: number;
  avgResolutionDays: number;
  openRequests: number;
  criticalRequests: number;
  mostMaintainedEquipment: unknown[];
  maintenanceByMonth: unknown[];
}

export interface LankaInsightsDTO {
  peakSeasonMonths: string[];
  lowSeasonMonths: string[];
  avuruduImpact: { year: number; avgAttendanceDrop: number; aprilData: DailyAttendanceDTO[] };
  monsoonBoostPct: number;
  paymentPeakDay: string;
  paydayUpliftPct: number;
  whatsappRenewalRate: number;
  membershipTrends: { month: number; label: string; avgAttendance: number; avgRevenue: number; seasonTag: string }[];
}

export interface ScheduledReportDTO {
  id: string;
  gymId: string;
  name: string;
  reportType: string;
  frequency: string;
  recipients: string[];
  whatsappNumbers: string[];
  lastSentAt: string | null;
  nextSendAt: string;
  isActive: boolean;
}

export interface ReportExportDTO {
  id: string;
  reportType: string;
  format: string;
  fileUrl: string | null;
  fileSizeBytes: number | null;
  fromDate: string;
  toDate: string;
  generatedBy: string;
  generatedAt: string;
  expiresAt: string | null;
  downloadCount: number;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useDashboardKpis(from?: string, to?: string) {
  const [data, setData] = useState<DashboardKpiDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const f = from ?? startOfMonth();
  const t = to   ?? today();

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: DashboardKpiDTO }>(`/reports/dashboard/kpis?from=${f}&to=${t}`);
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }, [f, t]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useTodayKpis() {
  const [data, setData] = useState<DashboardKpiDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: DashboardKpiDTO }>("/reports/dashboard/today")
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useRevenueReport(from?: string, to?: string) {
  const [data, setData] = useState<RevenueReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const f = from ?? daysAgo(30);
  const t = to   ?? today();

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: RevenueReportDTO }>(`/reports/revenue?from=${f}&to=${t}`);
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }, [f, t]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useMonthlyRevenueTrend(months = 12) {
  const [data, setData] = useState<MonthlyRevenueDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: MonthlyRevenueDTO[] }>(`/reports/revenue/monthly-trend?months=${months}`)
      .then(r => setData(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [months]);

  return { data, loading };
}

export function useMemberReport(from?: string, to?: string) {
  const [data, setData] = useState<MemberReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const f = from ?? startOfMonth();
  const t = to   ?? today();

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: MemberReportDTO }>(`/reports/members?from=${f}&to=${t}`);
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }, [f, t]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useMemberGrowthTrend(months = 12) {
  const [data, setData] = useState<MonthlyGrowthDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: MonthlyGrowthDTO[] }>(`/reports/members/growth-trend?months=${months}`)
      .then(r => setData(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [months]);

  return { data, loading };
}

export function useAttendanceReport(from?: string, to?: string, branchId?: string) {
  const [data, setData] = useState<AttendanceReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const f = from ?? daysAgo(30);
  const t = to   ?? today();

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ from: f, to: t });
      if (branchId) params.set("branchId", branchId);
      const res = await api.get<{ data: AttendanceReportDTO }>(`/reports/attendance?${params}`);
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }, [f, t, branchId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useAttendanceHeatmap(from?: string, to?: string) {
  const [data, setData] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  const f = from ?? daysAgo(30);
  const t = to   ?? today();

  useEffect(() => {
    api.get<{ data: Record<number, number> }>(`/reports/attendance/heatmap?from=${f}&to=${t}`)
      .then(r => setData(r.data.data ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [f, t]);

  return { data, loading };
}

export function useTrainerPerformanceReport(from?: string, to?: string) {
  const [data, setData] = useState<TrainerPerformanceReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const f = from ?? startOfMonth();
  const t = to   ?? today();

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: TrainerPerformanceReportDTO }>(`/reports/trainers?from=${f}&to=${t}`);
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }, [f, t]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useClassReport(from?: string, to?: string) {
  const [data, setData] = useState<ClassReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const f = from ?? startOfMonth();
  const t = to   ?? today();

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: ClassReportDTO }>(`/reports/classes?from=${f}&to=${t}`);
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }, [f, t]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useShopReport(from?: string, to?: string) {
  const [data, setData] = useState<ShopReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const f = from ?? startOfMonth();
  const t = to   ?? today();

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: ShopReportDTO }>(`/reports/shop?from=${f}&to=${t}`);
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }, [f, t]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useEquipmentReport(from?: string, to?: string) {
  const [data, setData] = useState<EquipmentReportDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const f = from ?? startOfMonth();
  const t = to   ?? today();

  useEffect(() => {
    api.get<{ data: EquipmentReportDTO }>(`/reports/equipment?from=${f}&to=${t}`)
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [f, t]);

  return { data, loading };
}

export function useLankaInsights() {
  const [data, setData] = useState<LankaInsightsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: LankaInsightsDTO }>("/reports/lanka-insights")
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useScheduledReports() {
  const [data, setData] = useState<ScheduledReportDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: ScheduledReportDTO[] }>("/reports/scheduled");
      setData(res.data.data ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (req: { name: string; reportType: string; frequency: string; recipients: string[]; whatsappNumbers: string[] }) => {
    const res = await api.post<{ data: ScheduledReportDTO }>("/reports/scheduled", req);
    await fetch();
    return res.data.data;
  };

  const toggle = async (id: string) => {
    await api.patch(`/reports/scheduled/${id}/toggle`);
    await fetch();
  };

  const remove = async (id: string) => {
    await api.delete(`/reports/scheduled/${id}`);
    await fetch();
  };

  return { data, loading, refetch: fetch, create, toggle, remove };
}

export function useReportExports(page = 0, size = 20) {
  const [data, setData] = useState<ReportExportDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: ReportExportDTO[] }>(`/reports/exports?page=${page}&size=${size}`);
      setData(res.data.data ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, size]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useExportCsv() {
  const [loading, setLoading] = useState(false);

  const download = async (type: string, from: string, to: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/exports/csv/${type}?from=${from}&to=${to}`, {
        responseType: "blob",
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `${type.toLowerCase()}_${from}_${to}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally { setLoading(false); }
  };

  return { download, loading };
}

// Legacy compat
export const useDashboardSummary = useDashboardKpis;
export const useMemberStats      = () => {
  const { data, loading } = useMemberReport();
  return { stats: data, loading };
};
