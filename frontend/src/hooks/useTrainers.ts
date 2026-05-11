"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Enums / Types ──────────────────────────────────────────────────────────

export type TrainerStatus   = "ACTIVE" | "INACTIVE" | "ON_LEAVE";
export type EmploymentType  = "FULL_TIME" | "PART_TIME" | "CONTRACT";
export type TrainerSpecialty =
  | "YOGA" | "HIIT" | "ZUMBA" | "PILATES" | "BOXING"
  | "SPINNING" | "STRENGTH" | "NUTRITION" | "CARDIO"
  | "CROSSFIT" | "REHABILITATION" | "PERSONAL_TRAINING" | "OTHER";
export type AssignmentType   = "PERSONAL_TRAINING" | "GROUP_CLASS" | "NUTRITION" | "REHABILITATION";
export type AssignmentStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type PTSessionStatus  = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type LeaveType        = "ANNUAL" | "SICK" | "UNPAID" | "OTHER";
export type LeaveStatus      = "PENDING" | "APPROVED" | "REJECTED";

export const SPECIALTY_EMOJI: Record<TrainerSpecialty, string> = {
  YOGA: "🧘", HIIT: "🔥", ZUMBA: "💃", PILATES: "🤸", BOXING: "🥊",
  SPINNING: "🚴", STRENGTH: "🏋️", NUTRITION: "🥗", CARDIO: "🏃",
  CROSSFIT: "⚡", REHABILITATION: "🩺", PERSONAL_TRAINING: "👤", OTHER: "🎯",
};

export const SPECIALTY_COLOR: Record<TrainerSpecialty, string> = {
  YOGA: "#34d399", HIIT: "#f87171", ZUMBA: "#fb923c", PILATES: "#a855f7",
  BOXING: "#f43f5e", SPINNING: "#facc15", STRENGTH: "#60a5fa", NUTRITION: "#4ade80",
  CARDIO: "#fb7185", CROSSFIT: "#f59e0b", REHABILITATION: "#22d3ee",
  PERSONAL_TRAINING: "#818cf8", OTHER: "#64748b",
};

export const STATUS_COLOR: Record<TrainerStatus, string> = {
  ACTIVE: "#22c55e", INACTIVE: "#6b7280", ON_LEAVE: "#f59e0b",
};

// ── DTOs ──────────────────────────────────────────────────────────────────

export interface TrainerDTO {
  id: string; gymId: string; branchId?: string;
  name: string; email: string; phone?: string; photoUrl?: string;
  status: TrainerStatus; employmentType: EmploymentType;
  primarySpecialty?: TrainerSpecialty; specialties: string[];
  experienceYears: number; rating: string; totalReviews: number;
  activeClientsCount: number; classesThisWeek: number; joinedDate: string;
}

export interface CertificationDTO {
  id: string; trainerId: string; name: string; issuingBody?: string;
  issuedDate?: string; expiryDate?: string; certificateUrl?: string;
  isVerified: boolean; isExpired: boolean; daysUntilExpiry: number;
}

export interface AvailabilityDTO {
  id: string; trainerId: string; dayOfWeek: number; dayOfWeekName: string;
  startTime: string; endTime: string; isAvailable: boolean;
}

export interface AssignmentDTO {
  id: string; trainerId: string; memberId: string;
  trainerName: string; memberName: string; memberPhone?: string;
  assignmentType: AssignmentType; status: AssignmentStatus;
  startedDate: string; endedDate?: string;
  sessionsTotal: number; sessionsUsed: number; sessionsRemaining: number;
  progressPercent: number; notes?: string;
}

export interface PTSessionDTO {
  id: string; trainerId: string; memberId: string; assignmentId?: string;
  trainerName: string; memberName: string;
  sessionDate: string; startTime: string; endTime: string;
  durationMinutes: number; status: PTSessionStatus;
  notes?: string; memberFeedback?: string; trainerNotes?: string;
}

export interface ReviewDTO {
  id: string; trainerId: string; memberId: string;
  reviewerName: string; rating: number; reviewText?: string;
  createdAt: string; starDisplay: string;
}

export interface TrainerMonthlyStatsDTO {
  trainerId: string; trainerName: string; month: string;
  completedSessions: number; cancelledSessions: number; noShowSessions: number;
  activeClients: number; newClientsThisMonth: number;
  averageRating: number; totalRevenueGenerated: number;
}

export interface TrainerDetailDTO extends TrainerDTO {
  nic?: string; bio?: string; salaryLkr?: number;
  certifications: CertificationDTO[];
  availability: AvailabilityDTO[];
  activeAssignments: AssignmentDTO[];
  recentSessions: PTSessionDTO[];
  recentReviews: ReviewDTO[];
  monthlyStats?: TrainerMonthlyStatsDTO;
  isOnLeaveToday: boolean;
}

export interface TrainerStatsDTO {
  totalTrainers: number; activeTrainers: number; onLeaveToday: number;
  averageRating: number; totalActivePTClients: number;
  topRatedTrainerName: string; topRatedTrainerRating: number;
  mostActiveTrainerName: string; mostActiveTrainerSessions: number;
}

export interface TrainerScheduleDTO {
  trainerId: string; trainerName: string; date: string;
  sessions: PTSessionDTO[]; isAvailable: boolean; isOnLeave: boolean;
}

interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
interface ApiResp<T> { success: boolean; data: T; message?: string; }

// ── Request types ─────────────────────────────────────────────────────────

export interface CreateTrainerRequest {
  name: string; email: string; phone: string; nic?: string; bio?: string;
  specialties: TrainerSpecialty[]; certificationNames?: string[];
  experienceYears?: number; employmentType: EmploymentType;
  branchId?: string; salaryLkr?: number; joinedDate: string;
  availability?: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[];
}

export interface UpdateTrainerRequest extends Partial<CreateTrainerRequest> {
  status?: TrainerStatus;
}

// ── Hooks ─────────────────────────────────────────────────────────────────

export function useTrainers(opts: {
  page?: number; size?: number; status?: TrainerStatus;
  branchId?: string; specialty?: TrainerSpecialty;
} = {}) {
  const { page = 0, size = 20, status, branchId, specialty } = opts;
  const [data,    setData]    = useState<Page<TrainerDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, size };
      if (status)   params.status   = status;
      if (branchId) params.branchId = branchId;
      if (specialty)params.specialty = specialty;
      const res = await api.get<ApiResp<Page<TrainerDTO>>>("/trainers", { params });
      setData(res.data.data);
      setError(null);
    } catch { setError("Failed to load trainers"); }
    finally   { setLoading(false); }
  }, [page, size, status, branchId, specialty]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

export function useTrainer(id: string | null) {
  const [data,    setData]    = useState<TrainerDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get<ApiResp<TrainerDetailDTO>>(`/trainers/${id}`)
      .then(r => { setData(r.data.data); setError(null); })
      .catch(() => setError("Failed to load trainer"))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

export function useTrainerStats() {
  const [data,    setData]    = useState<TrainerStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ApiResp<TrainerStatsDTO>>("/trainers/stats")
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useCreateTrainer() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const create = async (req: CreateTrainerRequest): Promise<TrainerDTO | null> => {
    try {
      setLoading(true); setError(null);
      const res = await api.post<ApiResp<TrainerDTO>>("/trainers", req);
      return res.data.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to create trainer");
      return null;
    } finally { setLoading(false); }
  };

  return { create, loading, error };
}

export function useUpdateTrainer() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const update = async (id: string, req: UpdateTrainerRequest): Promise<TrainerDTO | null> => {
    try {
      setLoading(true); setError(null);
      const res = await api.put<ApiResp<TrainerDTO>>(`/trainers/${id}`, req);
      return res.data.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to update trainer");
      return null;
    } finally { setLoading(false); }
  };

  return { update, loading, error };
}

export function useDeleteTrainer() {
  const [loading, setLoading] = useState(false);

  const remove = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await api.delete(`/trainers/${id}`);
      return true;
    } catch { return false; }
    finally  { setLoading(false); }
  };

  return { remove, loading };
}

export function useTrainerAssignments(opts: {
  trainerId?: string; memberId?: string; status?: AssignmentStatus;
  page?: number; size?: number;
} = {}) {
  const { trainerId, memberId, status, page = 0, size = 20 } = opts;
  const [data,    setData]    = useState<Page<AssignmentDTO> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, size };
      if (trainerId) params.trainerId = trainerId;
      if (memberId)  params.memberId  = memberId;
      if (status)    params.status    = status;
      const res = await api.get<ApiResp<Page<AssignmentDTO>>>("/trainer-assignments", { params });
      setData(res.data.data);
    } finally { setLoading(false); }
  }, [trainerId, memberId, status, page, size]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useCreateAssignment() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const create = async (req: {
    trainerId: string; memberId: string; assignmentType: AssignmentType;
    startedDate: string; sessionsTotal: number; notes?: string;
  }): Promise<AssignmentDTO | null> => {
    try {
      setLoading(true); setError(null);
      const res = await api.post<ApiResp<AssignmentDTO>>("/trainer-assignments", req);
      return res.data.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to create assignment");
      return null;
    } finally { setLoading(false); }
  };

  return { create, loading, error };
}

export function usePTSessions(opts: {
  trainerId?: string; memberId?: string; status?: PTSessionStatus;
  from?: string; to?: string; page?: number; size?: number;
} = {}) {
  const { trainerId, memberId, status, from, to, page = 0, size = 20 } = opts;
  const [data,    setData]    = useState<Page<PTSessionDTO> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, size };
      if (trainerId) params.trainerId = trainerId;
      if (memberId)  params.memberId  = memberId;
      if (status)    params.status    = status;
      if (from)      params.from      = from;
      if (to)        params.to        = to;
      const res = await api.get<ApiResp<Page<PTSessionDTO>>>("/pt-sessions", { params });
      setData(res.data.data);
    } finally { setLoading(false); }
  }, [trainerId, memberId, status, from, to, page, size]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useCreatePTSession() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const create = async (req: {
    trainerId: string; memberId: string; assignmentId?: string;
    sessionDate: string; startTime: string; endTime: string; notes?: string;
  }): Promise<PTSessionDTO | null> => {
    try {
      setLoading(true); setError(null);
      const res = await api.post<ApiResp<PTSessionDTO>>("/pt-sessions", req);
      return res.data.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to create session");
      return null;
    } finally { setLoading(false); }
  };

  return { create, loading, error };
}

export function useUpdateSessionStatus() {
  const [loading, setLoading] = useState(false);

  const update = async (sessionId: string, status: PTSessionStatus,
                         trainerNotes?: string, memberFeedback?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await api.patch(`/pt-sessions/${sessionId}/status`, { status, trainerNotes, memberFeedback });
      return true;
    } catch { return false; }
    finally  { setLoading(false); }
  };

  return { update, loading };
}

export function useTrainerLeave(trainerId: string | null) {
  const [data,    setData]    = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!trainerId) return;
    try {
      setLoading(true);
      const res = await api.get(`/trainer-leave/trainer/${trainerId}`);
      setData(res.data.data);
    } finally { setLoading(false); }
  }, [trainerId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
}

export function useRequestLeave() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const request = async (trainerId: string, req: {
    leaveType: LeaveType; fromDate: string; toDate: string; reason?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true); setError(null);
      await api.post(`/trainer-leave/trainer/${trainerId}/request`, req);
      return true;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to submit leave request");
      return false;
    } finally { setLoading(false); }
  };

  return { request, loading, error };
}

export function useAddCertification() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const add = async (trainerId: string, req: {
    name: string; issuingBody?: string;
    issuedDate?: string; expiryDate?: string; certificateUrl?: string;
  }): Promise<CertificationDTO | null> => {
    try {
      setLoading(true); setError(null);
      const res = await api.post<ApiResp<CertificationDTO>>(`/trainers/${trainerId}/certifications`, req);
      return res.data.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to add certification");
      return null;
    } finally { setLoading(false); }
  };

  return { add, loading, error };
}

export function useTrainerReviews(trainerId: string | null, page = 0, size = 10) {
  const [data,    setData]    = useState<Page<ReviewDTO> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    setLoading(true);
    api.get<ApiResp<Page<ReviewDTO>>>(`/pt-sessions/trainer/${trainerId}/reviews`, {
      params: { page, size },
    }).then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [trainerId, page, size]);

  return { data, loading };
}

export function useAddReview() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const add = async (trainerId: string, memberId: string, req: {
    rating: number; reviewText?: string; isAnonymous?: boolean;
  }): Promise<boolean> => {
    try {
      setLoading(true); setError(null);
      await api.post(`/pt-sessions/trainer/${trainerId}/reviews`, req, {
        params: { memberId },
      });
      return true;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to add review");
      return false;
    } finally { setLoading(false); }
  };

  return { add, loading, error };
}

export function useAvailableTrainers(date: string | null, time: string | null, specialty?: TrainerSpecialty) {
  const [data,    setData]    = useState<TrainerDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date || !time) return;
    setLoading(true);
    const params: Record<string, unknown> = { date, time };
    if (specialty) params.specialty = specialty;
    api.get<ApiResp<TrainerDTO[]>>("/trainers/available", { params })
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [date, time, specialty]);

  return { data, loading };
}

export function useTrainerSchedule(trainerId: string | null, date?: string) {
  const [data,    setData]    = useState<TrainerScheduleDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    setLoading(true);
    const params = date ? { date } : {};
    api.get<ApiResp<TrainerScheduleDTO>>(`/trainers/${trainerId}/schedule`, { params })
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [trainerId, date]);

  return { data, loading };
}
