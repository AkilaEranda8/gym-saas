"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EquipmentStatus    = "OPERATIONAL" | "MAINTENANCE" | "OUT_OF_ORDER" | "RETIRED" | "UNDER_INSPECTION";
export type EquipmentCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type MaintenanceStatus  = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "CANCELLED";
export type MaintenanceLogAction = "STATUS_CHANGE" | "COMMENT" | "COST_UPDATE" | "ASSIGNMENT" | "RESOLUTION";
export type ServiceType = "ROUTINE" | "DEEP_CLEAN" | "CALIBRATION" | "INSPECTION" | "PARTS_REPLACEMENT" | "OTHER";

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface EquipmentCategoryDTO {
  id: string;
  gymId: string;
  name: string;
  icon?: string;
  color?: string;
  equipmentCount: number;
}

export interface EquipmentDTO {
  id: string;
  gymId: string;
  branchId?: string;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  assetTag?: string;
  location?: string;
  quantity: number;
  purchaseDate?: string;
  purchasePriceLkr?: number;
  warrantyExpiry?: string;
  isWarrantyExpired: boolean;
  status: EquipmentStatus;
  statusColor: string;
  condition?: EquipmentCondition;
  conditionColor?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  serviceIntervalDays?: number;
  isServiceOverdue: boolean;
  daysUntilService: number;
  imageUrl?: string;
  qrCode?: string;
  notes?: string;
  openRequestsCount: number;
  totalMaintenanceCostLkr?: number;
  createdAt: string;
}

export interface EquipmentDetailDTO extends EquipmentDTO {
  serviceSchedules: ServiceScheduleDTO[];
  recentServiceRecords: ServiceRecordDTO[];
  latestInspection?: InspectionDTO;
  openRequests: MaintenanceRequestDTO[];
}

export interface MaintenanceRequestDTO {
  id: string;
  gymId: string;
  branchId?: string;
  equipmentId: string;
  equipmentName?: string;
  equipmentLocation?: string;
  requestNumber: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  priorityColor: string;
  status: MaintenanceStatus;
  reportedBy: string;
  reportedByName?: string;
  assignedTo?: string;
  assignedToName?: string;
  estimatedCostLkr?: number;
  actualCostLkr?: number;
  dueDate?: string;
  startedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  isOverdue: boolean;
  logCount: number;
}

export interface MaintenanceRequestDetailDTO extends MaintenanceRequestDTO {
  logs: MaintenanceLogDTO[];
  equipment?: EquipmentDTO;
}

export interface MaintenanceLogDTO {
  id: string;
  requestId: string;
  loggedBy: string;
  loggedByName?: string;
  action: MaintenanceLogAction;
  oldStatus?: string;
  newStatus?: string;
  comment?: string;
  costLkr?: number;
  createdAt: string;
}

export interface ServiceScheduleDTO {
  id: string;
  gymId: string;
  equipmentId: string;
  equipmentName?: string;
  serviceType: ServiceType;
  frequencyDays: number;
  lastServiceDate?: string;
  nextServiceDate: string;
  daysUntilService: number;
  isOverdue: boolean;
  assignedTo?: string;
  serviceProvider?: string;
  estimatedCostLkr?: number;
  notes?: string;
  isActive: boolean;
}

export interface ServiceRecordDTO {
  id: string;
  gymId: string;
  equipmentId: string;
  equipmentName?: string;
  scheduleId?: string;
  serviceType: ServiceType;
  serviceDate: string;
  performedBy?: string;
  serviceProvider?: string;
  costLkr?: number;
  durationHours?: number;
  conditionBefore?: string;
  conditionAfter?: string;
  partsReplaced: string[];
  description: string;
  notes?: string;
  nextServiceDate?: string;
  invoiceUrl?: string;
  createdAt: string;
}

export interface InspectionDTO {
  id: string;
  gymId: string;
  equipmentId: string;
  equipmentName?: string;
  inspectedBy: string;
  inspectedByName?: string;
  inspectionDate: string;
  overallRating: number;
  isOperational: boolean;
  issuesFound?: string;
  actionsRequired?: string;
  nextInspectionDate?: string;
  photosUrls: string[];
  createdAt: string;
}

export interface EquipmentStatsDTO {
  totalEquipment: number;
  operationalCount: number;
  maintenanceCount: number;
  outOfOrderCount: number;
  retiredCount: number;
  underInspectionCount: number;
  serviceOverdueCount: number;
  openRequestsCount: number;
  criticalRequestsCount: number;
  totalMaintenanceCostThisMonth?: number;
  upcomingServicesThisWeek: number;
  equipmentValueLkr?: number;
}

export interface MaintenanceSummaryDTO {
  openRequests: number;
  inProgressRequests: number;
  resolvedThisMonth: number;
  criticalOpen: number;
  avgResolutionDays?: number;
  totalCostThisMonth?: number;
  requestsByPriority: Record<string, number>;
}

// ── Equipment hooks ────────────────────────────────────────────────────────────

export function useEquipmentList(params?: {
  page?: number; size?: number; categoryId?: string;
  status?: EquipmentStatus; branchId?: string; search?: string;
}) {
  const { page = 0, size = 20, categoryId, status, branchId, search } = params ?? {};
  const [data, setData]     = useState<PageResponse<EquipmentDTO> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), size: String(size) });
      if (categoryId) q.set("categoryId", categoryId);
      if (status)     q.set("status", status);
      if (branchId)   q.set("branchId", branchId);
      if (search)     q.set("search", search);
      const { data: res } = await api.get<{ data: PageResponse<EquipmentDTO> }>(`/equipment?${q}`);
      setData(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, size, categoryId, status, branchId, search]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useEquipmentDetail(id: string | null) {
  const [equipment, setEquipment] = useState<EquipmentDetailDTO | null>(null);
  const [loading, setLoading]     = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get<{ data: EquipmentDetailDTO }>(`/equipment/${id}`);
      setEquipment(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { equipment, loading, refetch: fetch };
}

export function useEquipmentStats() {
  const [stats, setStats]   = useState<EquipmentStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ data: EquipmentStatsDTO }>("/equipment/stats");
      setStats(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, refetch: fetch };
}

export function useEquipmentCategories() {
  const [categories, setCategories] = useState<EquipmentCategoryDTO[]>([]);
  const [loading, setLoading]       = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ data: EquipmentCategoryDTO[] }>("/equipment/categories");
      setCategories(data.data ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { categories, loading, refetch: fetch };
}

export function useServiceDueSoon(days = 14) {
  const [items, setItems]     = useState<EquipmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ data: EquipmentDTO[] }>(`/equipment/service-due?days=${days}`)
      .then(({ data }) => setItems(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  return { items, loading };
}

// ── Mutation hooks ─────────────────────────────────────────────────────────────

export function useCreateEquipment() {
  const [loading, setLoading] = useState(false);
  const create = async (req: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: EquipmentDTO }>("/equipment", req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

export function useUpdateEquipment() {
  const [loading, setLoading] = useState(false);
  const update = async (id: string, req: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.put<{ data: EquipmentDTO }>(`/equipment/${id}`, req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { update, loading };
}

export function useUpdateEquipmentStatus() {
  const [loading, setLoading] = useState(false);
  const updateStatus = async (id: string, req: { status: EquipmentStatus; condition?: EquipmentCondition; notes?: string }) => {
    setLoading(true);
    try {
      const { data } = await api.patch<{ data: EquipmentDTO }>(`/equipment/${id}/status`, req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { updateStatus, loading };
}

export function useDeleteEquipment() {
  const [loading, setLoading] = useState(false);
  const deleteEquipment = async (id: string) => {
    setLoading(true);
    try { await api.delete(`/equipment/${id}`); return true; }
    catch { return false; } finally { setLoading(false); }
  };
  return { deleteEquipment, loading };
}

export function useCreateCategory() {
  const [loading, setLoading] = useState(false);
  const create = async (req: { name: string; icon?: string; color?: string }) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: EquipmentCategoryDTO }>("/equipment/categories", req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

// ── Maintenance hooks ─────────────────────────────────────────────────────────

export function useMaintenanceList(params?: {
  page?: number; size?: number; equipmentId?: string;
  status?: MaintenanceStatus; priority?: MaintenancePriority;
  from?: string; to?: string;
}) {
  const { page = 0, size = 20, equipmentId, status, priority, from, to } = params ?? {};
  const [data, setData]     = useState<PageResponse<MaintenanceRequestDTO> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(page), size: String(size) });
      if (equipmentId) q.set("equipmentId", equipmentId);
      if (status)   q.set("status", status);
      if (priority) q.set("priority", priority);
      if (from)     q.set("from", from);
      if (to)       q.set("to", to);
      const { data: res } = await api.get<{ data: PageResponse<MaintenanceRequestDTO> }>(
        `/equipment/maintenance?${q}`);
      setData(res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, size, equipmentId, status, priority, from, to]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useMaintenanceDetail(id: string | null) {
  const [request, setRequest] = useState<MaintenanceRequestDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get<{ data: MaintenanceRequestDetailDTO }>(`/equipment/maintenance/${id}`);
      setRequest(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);
  return { request, loading, refetch: fetch };
}

export function useMaintenanceSummary() {
  const [summary, setSummary] = useState<MaintenanceSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ data: MaintenanceSummaryDTO }>("/equipment/maintenance/summary");
      setSummary(data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { summary, loading, refetch: fetch };
}

export function useCreateMaintenanceRequest() {
  const [loading, setLoading] = useState(false);
  const create = async (req: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: MaintenanceRequestDTO }>("/equipment/maintenance", req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

export function useUpdateMaintenanceStatus() {
  const [loading, setLoading] = useState(false);
  const updateStatus = async (id: string, req: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.patch<{ data: MaintenanceRequestDTO }>(
        `/equipment/maintenance/${id}/status`, req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { updateStatus, loading };
}

export function useAddMaintenanceComment() {
  const [loading, setLoading] = useState(false);
  const addComment = async (id: string, req: { comment: string; costLkr?: number }) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: MaintenanceLogDTO }>(
        `/equipment/maintenance/${id}/comments`, req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { addComment, loading };
}

// ── Service hooks ──────────────────────────────────────────────────────────────

export function useServiceSchedules(equipmentId: string | null) {
  const [schedules, setSchedules] = useState<ServiceScheduleDTO[]>([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!equipmentId) return;
    setLoading(true);
    api.get<{ data: ServiceScheduleDTO[] }>(`/equipment/service/schedules/${equipmentId}`)
      .then(({ data }) => setSchedules(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [equipmentId]);

  return { schedules, loading };
}

export function useUpcomingSchedules(days = 14) {
  const [schedules, setSchedules] = useState<ServiceScheduleDTO[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ data: ServiceScheduleDTO[] }>(`/equipment/service/schedules/upcoming?days=${days}`)
      .then(({ data }) => setSchedules(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [days]);

  return { schedules, loading };
}

export function useServiceRecords(equipmentId: string | null, page = 0, size = 10) {
  const [data, setData]     = useState<PageResponse<ServiceRecordDTO> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!equipmentId) return;
    setLoading(true);
    api.get<{ data: PageResponse<ServiceRecordDTO> }>(
      `/equipment/service/records/${equipmentId}?page=${page}&size=${size}`)
      .then(({ data: res }) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [equipmentId, page, size]);

  return { data, loading };
}

export function useCreateServiceRecord() {
  const [loading, setLoading] = useState(false);
  const create = async (req: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: ServiceRecordDTO }>("/equipment/service/records", req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

export function useCreateServiceSchedule() {
  const [loading, setLoading] = useState(false);
  const create = async (req: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: ServiceScheduleDTO }>("/equipment/service/schedules", req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

// ── Inspection hooks ───────────────────────────────────────────────────────────

export function useEquipmentInspections(equipmentId: string | null) {
  const [inspections, setInspections] = useState<InspectionDTO[]>([]);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (!equipmentId) return;
    setLoading(true);
    api.get<{ data: InspectionDTO[] }>(`/equipment/inspections/${equipmentId}`)
      .then(({ data }) => setInspections(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [equipmentId]);

  return { inspections, loading };
}

export function useCreateInspection() {
  const [loading, setLoading] = useState(false);
  const create = async (req: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: InspectionDTO }>("/equipment/inspections", req);
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { create, loading };
}

// ── Legacy compat (for old components) ───────────────────────────────────────

export function useEquipment(page = 0, size = 20) {
  return useEquipmentList({ page, size });
}

export function usePendingMaintenance() {
  return useMaintenanceList({ status: "OPEN", size: 50 });
}
