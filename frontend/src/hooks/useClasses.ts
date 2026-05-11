"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────

export type ClassType =
  | "YOGA" | "HIIT" | "ZUMBA" | "PILATES" | "BOXING"
  | "SPINNING" | "STRENGTH" | "MEDITATION"
  | "DANCE" | "CARDIO" | "CROSSFIT" | "OTHER";

export type ClassDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
export type SessionStatus    = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type BookingStatus    = "BOOKED" | "ATTENDED" | "CANCELLED" | "NO_SHOW" | "WAITLISTED";

export const CLASS_COLORS: Record<ClassType, string> = {
  YOGA: "#34d399", HIIT: "#f87171", ZUMBA: "#fb923c", PILATES: "#a855f7",
  BOXING: "#f43f5e", SPINNING: "#facc15", STRENGTH: "#60a5fa",
  MEDITATION: "#2dd4bf", DANCE: "#f472b6", CARDIO: "#fb7185",
  CROSSFIT: "#f59e0b", OTHER: "#64748b",
};

export const CLASS_EMOJIS: Record<ClassType, string> = {
  YOGA: "🧘", HIIT: "🔥", ZUMBA: "💃", PILATES: "🤸", BOXING: "🥊",
  SPINNING: "🚴", STRENGTH: "🏋️", MEDITATION: "🧘‍♀️", DANCE: "🕺",
  CARDIO: "❤️", CROSSFIT: "⚡", OTHER: "🏃",
};

export interface FitnessClassDTO {
  id: string; gymId: string; branchId?: string; trainerId?: string;
  trainerName?: string; name: string; description?: string;
  type: ClassType; room?: string; capacity: number; durationMinutes: number;
  difficulty: ClassDifficulty; color: string; isRecurring: boolean;
  schedulesCount: number; activeSchedules: number;
}

export interface ClassScheduleDTO {
  id: string; classId: string; dayOfWeek: number; dayOfWeekName: string;
  startTime: string; endTime: string; maxCapacity: number;
  isActive: boolean; effectiveFrom: string; effectiveUntil?: string;
}

export interface ClassDetailDTO extends FitnessClassDTO {
  schedules: ClassScheduleDTO[];
  upcomingSessions: ClassSessionDTO[];
  totalBookingsAllTime: number;
  averageAttendanceRate: number;
}

export interface ClassSessionDTO {
  id: string; classId: string; gymId: string;
  className: string; classType: ClassType; classColor: string;
  trainerName?: string; room?: string;
  sessionDate: string; startTime: string; endTime: string;
  durationMinutes: number; actualCapacity: number;
  bookedCount: number; availableSlots: number; waitlistCount: number;
  status: SessionStatus; fillPercentage: number;
  isFull: boolean; isUserBooked: boolean; userBookingStatus?: BookingStatus;
}

export interface ClassBookingDTO {
  id: string; sessionId: string; memberId: string;
  memberName?: string; memberPhone?: string;
  status: BookingStatus; bookedAt: string;
  cancelledAt?: string; cancelReason?: string;
  waitlistPosition?: number; attendedAt?: string;
}

export interface WeekScheduleDTO {
  weekStart: string; weekEnd: string;
  days: Record<string, ClassSessionDTO[]>;
}

export interface ClassStatsDTO {
  totalClasses: number; totalSessionsThisMonth: number;
  totalBookingsThisMonth: number; averageFillRate: number;
  mostPopularClass?: string; mostActiveTrainer?: string;
  cancelledSessionsThisMonth: number;
}

export interface CreateClassRequest {
  name: string; description?: string; type: ClassType;
  trainerId?: string; branchId?: string; room?: string;
  capacity: number; durationMinutes: number;
  difficulty?: ClassDifficulty; isRecurring: boolean;
  schedules?: { dayOfWeek: number; startTime: string; maxCapacity: number }[];
}

export interface CreateSessionRequest {
  classId: string; sessionDate: string; startTime: string;
  trainerId?: string; actualCapacity?: number; notes?: string;
}

// ── Generic fetcher hook ────────────────────────────────────────

function useFetch<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!url) return;
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: T }>(url);
      setData(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to fetch");
    } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ── Hooks ──────────────────────────────────────────────────────

export function useClasses(filters: {
  page?: number; size?: number; type?: ClassType; trainerId?: string; branchId?: string;
} = {}) {
  const params = new URLSearchParams();
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.size !== undefined) params.set("size", String(filters.size));
  if (filters.type)      params.set("type", filters.type);
  if (filters.trainerId) params.set("trainerId", filters.trainerId);
  if (filters.branchId)  params.set("branchId", filters.branchId);
  const url = `/classes?${params}`;

  const [data, setData]       = useState<{ content: FitnessClassDTO[]; totalElements: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ data: any }>(url);
      setData(res.data.data);
    } catch (e: any) { setError(e?.response?.data?.message || "Error"); }
    finally { setLoading(false); }
  }, [url]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

export function useClass(id: string | null) {
  return useFetch<ClassDetailDTO>(id ? `/classes/${id}` : null);
}

export function useClassStats() {
  const hook = useFetch<ClassStatsDTO>("/classes/stats");
  useEffect(() => {
    const timer = setInterval(hook.refetch, 60000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return hook;
}

export function useWeekSchedule(weekStart: string, branchId?: string) {
  const params = new URLSearchParams({ weekStart });
  if (branchId) params.set("branchId", branchId);
  return useFetch<WeekScheduleDTO>(`/classes/sessions/week?${params}`, [weekStart, branchId]);
}

export function useDaySchedule(date: string, branchId?: string) {
  const params = new URLSearchParams({ date });
  if (branchId) params.set("branchId", branchId);
  return useFetch<ClassSessionDTO[]>(`/classes/sessions/day?${params}`, [date, branchId]);
}

export function useSession(sessionId: string | null) {
  return useFetch<ClassSessionDTO>(sessionId ? `/classes/sessions/${sessionId}` : null);
}

export function useSessionBookings(sessionId: string | null) {
  return useFetch<ClassBookingDTO[]>(sessionId ? `/classes/sessions/${sessionId}/bookings` : null);
}

// ── Mutations ──────────────────────────────────────────────────

export function useCreateClass() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const mutate = async (req: CreateClassRequest) => {
    setLoading(true); setError(null);
    try {
      const res = await api.post<{ data: FitnessClassDTO }>("/classes", req);
      return res.data.data;
    } catch (e: any) { setError(e?.response?.data?.message || "Error"); throw e; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
}

export function useUpdateClass() {
  const [loading, setLoading] = useState(false);
  const mutate = async (id: string, req: Partial<CreateClassRequest>) => {
    const res = await api.put<{ data: FitnessClassDTO }>(`/classes/${id}`, req);
    return res.data.data;
  };
  return { mutate, loading };
}

export function useDeleteClass() {
  const [loading, setLoading] = useState(false);
  const mutate = async (id: string) => {
    setLoading(true);
    try { await api.delete(`/classes/${id}`); }
    finally { setLoading(false); }
  };
  return { mutate, loading };
}

export function useBookClass() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const mutate = async (sessionId: string, memberId?: string) => {
    setLoading(true); setError(null);
    try {
      const res = await api.post<{ data: ClassBookingDTO }>("/classes/bookings", { sessionId, memberId });
      return res.data.data;
    } catch (e: any) { setError(e?.response?.data?.message || "Error"); throw e; }
    finally { setLoading(false); }
  };
  return { mutate, loading, error };
}

export function useCancelBooking() {
  const [loading, setLoading] = useState(false);
  const mutate = async (bookingId: string, reason?: string) => {
    setLoading(true);
    try {
      const res = await api.delete<{ data: ClassBookingDTO }>(`/classes/bookings/${bookingId}`, { data: { reason } });
      return res.data.data;
    } finally { setLoading(false); }
  };
  return { mutate, loading };
}

export function useMarkAttended() {
  const mutate = async (bookingId: string) => {
    const res = await api.post<{ data: ClassBookingDTO }>(`/classes/bookings/${bookingId}/mark-attended`);
    return res.data.data;
  };
  return { mutate };
}

export function useCreateSession() {
  const [loading, setLoading] = useState(false);
  const mutate = async (req: CreateSessionRequest) => {
    setLoading(true);
    try {
      const res = await api.post<{ data: ClassSessionDTO }>("/classes/sessions", req);
      return res.data.data;
    } finally { setLoading(false); }
  };
  return { mutate, loading };
}

export function useUpdateSessionStatus() {
  const [loading, setLoading] = useState(false);
  const mutate = async (sessionId: string, status: SessionStatus, notes?: string, cancelReason?: string) => {
    setLoading(true);
    try {
      const res = await api.patch<{ data: ClassSessionDTO }>(`/classes/sessions/${sessionId}/status`, { status, notes, cancelReason });
      return res.data.data;
    } finally { setLoading(false); }
  };
  return { mutate, loading };
}
