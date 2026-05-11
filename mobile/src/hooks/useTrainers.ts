import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

// ── Types ──────────────────────────────────────────────────────────────────

export type TrainerStatus   = "ACTIVE" | "INACTIVE" | "ON_LEAVE";
export type EmploymentType  = "FULL_TIME" | "PART_TIME" | "CONTRACT";
export type PTSessionStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
export type LeaveType       = "ANNUAL" | "SICK" | "UNPAID" | "OTHER";
export type LeaveStatus     = "PENDING" | "APPROVED" | "REJECTED";

export interface TrainerDTO {
  id: string; gymId: string; branchId?: string;
  name: string; email: string; phone?: string; photoUrl?: string;
  status: TrainerStatus; employmentType: EmploymentType;
  primarySpecialty?: string; specialties: string[];
  experienceYears: number; rating: string; totalReviews: number;
  activeClientsCount: number; joinedDate: string;
}

export interface PTSessionDTO {
  id: string; trainerId: string; memberId: string;
  trainerName: string; memberName: string;
  sessionDate: string; startTime: string; endTime: string;
  durationMinutes: number; status: PTSessionStatus;
  notes?: string; memberFeedback?: string;
}

export interface AssignmentDTO {
  id: string; trainerId: string; memberId: string;
  trainerName: string; memberName: string;
  assignmentType: string; status: string;
  startedDate: string; sessionsTotal: number;
  sessionsUsed: number; sessionsRemaining: number; progressPercent: number;
}

interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; }
interface ApiResp<T> { success: boolean; data: T; message?: string; }

// ── Hooks ─────────────────────────────────────────────────────────────────

export function useTrainers(status?: TrainerStatus) {
  const [trainers, setTrainers] = useState<TrainerDTO[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const params = status ? { status } : {};
      const res = await api.get<ApiResp<Page<TrainerDTO>>>("/api/v1/trainers", { params });
      setTrainers(res.data.data.content);
      setError(null);
    } catch {
      setError("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);
  return { trainers, loading, error, refetch: fetch };
}

export function useTrainerDetail(trainerId: string | null) {
  const [data,    setData]    = useState<TrainerDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    setLoading(true);
    api.get<ApiResp<TrainerDTO>>(`/api/v1/trainers/${trainerId}`)
      .then((r: { data: ApiResp<TrainerDTO> }) => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [trainerId]);

  return { data, loading };
}

export function useMyPTSessions(memberId: string | null, status?: PTSessionStatus) {
  const [sessions, setSessions] = useState<PTSessionDTO[]>([]);
  const [loading,  setLoading]  = useState(false);

  const fetch = useCallback(async () => {
    if (!memberId) return;
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page: 0, size: 20 };
      if (status) params.status = status;
      const res = await api.get<ApiResp<Page<PTSessionDTO>>>(
        `/api/v1/pt-sessions/member/${memberId}`, { params });
      setSessions(res.data.data.content);
    } finally {
      setLoading(false);
    }
  }, [memberId, status]);

  useEffect(() => { fetch(); }, [fetch]);
  return { sessions, loading, refetch: fetch };
}

export function useMyAssignment(memberId: string | null) {
  const [assignments, setAssignments] = useState<AssignmentDTO[]>([]);
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    api.get<ApiResp<Page<AssignmentDTO>>>("/api/v1/trainer-assignments", {
      params: { memberId, status: "ACTIVE", page: 0, size: 5 },
    }).then((r: { data: ApiResp<Page<AssignmentDTO>> }) => setAssignments(r.data.data.content))
      .finally(() => setLoading(false));
  }, [memberId]);

  return { assignments, loading };
}

export function useAddReview() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const submit = async (trainerId: string, memberId: string,
    rating: number, reviewText?: string, isAnonymous = false): Promise<boolean> => {
    try {
      setLoading(true); setError(null);
      await api.post(`/api/v1/pt-sessions/trainer/${trainerId}/reviews`,
        { rating, reviewText, isAnonymous }, { params: { memberId } });
      return true;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to submit review");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}

export function useUpdateSessionStatus() {
  const [loading, setLoading] = useState(false);

  const update = async (sessionId: string, status: PTSessionStatus, trainerNotes?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await api.patch(`/api/v1/pt-sessions/${sessionId}/status`, { status, trainerNotes });
      return true;
    } catch { return false; }
    finally  { setLoading(false); }
  };

  return { update, loading };
}
