import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EquipmentStatus    = "OPERATIONAL" | "MAINTENANCE" | "OUT_OF_ORDER" | "RETIRED" | "UNDER_INSPECTION";
export type EquipmentCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface EquipmentDTO {
  id: string;
  gymId: string;
  branchId?: string;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  location?: string;
  quantity: number;
  status: EquipmentStatus;
  statusColor: string;
  condition?: EquipmentCondition;
  isServiceOverdue: boolean;
  isWarrantyExpired: boolean;
  openRequestsCount: number;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface EquipmentDetailDTO extends EquipmentDTO {
  serialNumber?: string;
  assetTag?: string;
  purchaseDate?: string;
  purchasePriceLkr?: number;
  warrantyExpiry?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  serviceIntervalDays?: number;
  daysUntilService: number;
  totalMaintenanceCostLkr?: number;
  qrCode?: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useEquipmentList(params?: {
  status?: EquipmentStatus; categoryId?: string; branchId?: string; search?: string;
}) {
  const { status, categoryId, branchId, search } = params ?? {};
  const [items, setItems]     = useState<EquipmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: "0", size: "50" });
      if (status)     q.set("status", status);
      if (categoryId) q.set("categoryId", categoryId);
      if (branchId)   q.set("branchId", branchId);
      if (search)     q.set("search", search);
      const { data } = await api.get<{ data: PageResponse<EquipmentDTO> }>(`/equipment?${q}`);
      setItems(data.data?.content ?? []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [status, categoryId, branchId, search]);

  useEffect(() => { fetch(); }, [fetch]);
  return { items, loading, refetch: fetch };
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

export function useEquipmentByQrCode(qrCode: string | null) {
  const [equipment, setEquipment] = useState<EquipmentDTO | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!qrCode) return;
    setLoading(true); setError(null);
    try {
      const { data } = await api.get<{ data: EquipmentDTO }>(`/equipment/qr/${qrCode}`);
      setEquipment(data.data);
    } catch {
      setError("Equipment not found.");
    } finally { setLoading(false); }
  }, [qrCode]);

  useEffect(() => { fetch(); }, [fetch]);
  return { equipment, loading, error };
}

export function useReportIssue() {
  const [loading, setLoading] = useState(false);
  const report = async (req: {
    equipmentId: string; title: string; description?: string; priority?: MaintenancePriority;
  }) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ data: { requestNumber: string } }>(
        "/equipment/maintenance",
        { ...req, priority: req.priority ?? "MEDIUM" }
      );
      return data.data;
    } catch { return null; } finally { setLoading(false); }
  };
  return { report, loading };
}
