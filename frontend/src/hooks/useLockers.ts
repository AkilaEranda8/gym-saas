"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "/api/v1/lockers";

// ── Types ──────────────────────────────────────────────────────────────────────
export type LockerStatus     = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
export type LockerSize       = "SMALL" | "MEDIUM" | "LARGE";
export type AssignmentStatus = "ACTIVE" | "EXPIRED" | "RELEASED";

export interface LockerDTO {
  id: string;
  gymId: string;
  branchId?: string;
  lockerNumber: string;
  size: LockerSize;
  monthlyRate: number;
  status: LockerStatus;
  assignedTo?: string;
  assignedMemberId?: string;
  assignmentEnd?: string;
}

export interface LockerAssignmentDTO {
  id: string;
  lockerId: string;
  lockerNumber: string;
  lockerSize: LockerSize;
  memberId: string;
  memberName: string;
  startDate: string;
  endDate?: string;
  monthlyRate: number;
  status: AssignmentStatus;
  expired: boolean;
}

export interface LockerStatsDTO {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  activeAssignments: number;
  expiringThisWeek: number;
  monthlyRevenue: number;
}

// ── Read hooks ─────────────────────────────────────────────────────────────────
export function useLockers() {
  const [lockers, setLockers]   = useState<LockerDTO[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setLockers(res.data?.data ?? []);
    } catch { setLockers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { lockers, loading, refetch: fetch };
}

export function useLockerStats() {
  const [stats, setStats]     = useState<LockerStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/stats`);
      setStats(res.data?.data ?? null);
    } catch { setStats(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, refetch: fetch };
}

export function useLockerAssignments(status?: AssignmentStatus) {
  const [assignments, setAssignments] = useState<LockerAssignmentDTO[]>([]);
  const [loading, setLoading]         = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : "";
      const res = await axios.get(`${API}/assignments${params}`);
      setAssignments(res.data?.data ?? []);
    } catch { setAssignments([]); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);
  return { assignments, loading, refetch: fetch };
}

// ── Mutation hooks ─────────────────────────────────────────────────────────────
export function useCreateLocker() {
  const [loading, setLoading] = useState(false);
  const create = async (req: {
    lockerNumber: string;
    size: LockerSize;
    monthlyRate: number;
    branchId?: string;
  }) => {
    setLoading(true);
    try {
      const res = await axios.post(API, req);
      return res.data?.data as LockerDTO;
    } catch { return null; }
    finally { setLoading(false); }
  };
  return { create, loading };
}

export function useUpdateLocker() {
  const [loading, setLoading] = useState(false);
  const update = async (id: string, req: {
    lockerNumber?: string;
    size?: LockerSize;
    monthlyRate?: number;
    status?: LockerStatus;
  }) => {
    setLoading(true);
    try {
      const res = await axios.put(`${API}/${id}`, req);
      return res.data?.data as LockerDTO;
    } catch { return null; }
    finally { setLoading(false); }
  };
  return { update, loading };
}

export function useDeleteLocker() {
  const [loading, setLoading] = useState(false);
  const deleteLocker = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API}/${id}`);
      return true;
    } catch { return false; }
    finally { setLoading(false); }
  };
  return { deleteLocker, loading };
}

export function useAssignLocker() {
  const [loading, setLoading] = useState(false);
  const assign = async (lockerId: string, req: { memberId: string; endDate?: string }) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/${lockerId}/assign`, req);
      return res.data?.data as LockerAssignmentDTO;
    } catch { return null; }
    finally { setLoading(false); }
  };
  return { assign, loading };
}

export function useReleaseLocker() {
  const [loading, setLoading] = useState(false);
  const release = async (assignmentId: string) => {
    setLoading(true);
    try {
      await axios.delete(`${API}/assignments/${assignmentId}`);
      return true;
    } catch { return false; }
    finally { setLoading(false); }
  };
  return { release, loading };
}
