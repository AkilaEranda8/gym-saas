"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export interface Member {
  id: string;
  gymId: string;
  branchId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  nic?: string;
  photoUrl?: string;
  status: "ACTIVE" | "EXPIRING" | "EXPIRED" | "SUSPENDED" | "INACTIVE";
  joinDate: string;
  expiryDate?: string;
  qrCode?: string;
  lockerId?: string;
  workoutPlanId?: string;
  nutritionPlanId?: string;
  notes?: string;
  createdAt: string;
}

export interface MemberDetail extends Member {
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  latestBodyMetric?: BodyMetric;
  recentAttendance?: Attendance[];
}

export interface BodyMetric {
  id: string;
  memberId: string;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  bodyFatPct?: number;
  muscleMassKg?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
  recordedDate: string;
  notes?: string;
  bmiStatus?: string;
  bmiStatusColor?: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  checkInTime: string;
  checkOutTime?: string;
  checkInMethod: string;
  durationMinutes?: number;
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  expiringThisWeek: number;
  expiredMembers: number;
  checkedInToday: number;
  newThisMonth: number;
}

export interface PageData<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export function useMembers(params: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  branchId?: string;
} = {}) {
  const [data, setData]       = useState<PageData<Member> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams();
    q.set("page", String(params.page ?? 0));
    q.set("size", String(params.size ?? 20));
    if (params.search)   q.set("search", params.search);
    if (params.status)   q.set("status", params.status);
    if (params.branchId) q.set("branchId", params.branchId);
    api.get(`/members?${q}`)
      .then((r) => setData(r.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.page, params.size, params.search, params.status, params.branchId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}

export function useMember(id: string) {
  const [member, setMember]   = useState<MemberDetail | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/members/${id}`)
      .then((r) => setMember(r.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { member, isLoading, error };
}

export function useMemberStats() {
  const [stats, setStats]     = useState<MemberStats | null>(null);
  const [isLoading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    api.get("/members/stats")
      .then((r) => setStats(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { stats, isLoading };
}

export function useMemberBodyMetrics(memberId: string) {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [isLoading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    if (!memberId) return;
    setLoading(true);
    api.get(`/members/${memberId}/body-metrics`)
      .then((r) => setMetrics(r.data.data ?? []))
      .finally(() => setLoading(false));
  }, [memberId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addMetric = async (data: Record<string, unknown>) => {
    const r = await api.post(`/members/${memberId}/body-metrics`, data);
    fetch();
    return r.data.data;
  };

  return { metrics, isLoading, addMetric, refetch: fetch };
}

export function useMemberAttendance(memberId: string) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setLoading]     = useState(true);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    api.get(`/members/${memberId}/attendance?size=20`)
      .then((r) => setAttendance(r.data.data?.content ?? []))
      .finally(() => setLoading(false));
  }, [memberId]);

  return { attendance, isLoading };
}

export async function createMember(data: Record<string, unknown>) {
  const r = await api.post("/members", data);
  return r.data.data;
}

export async function updateMember(id: string, data: Record<string, unknown>) {
  const r = await api.put(`/members/${id}`, data);
  return r.data.data;
}

export async function deleteMember(id: string) {
  await api.delete(`/members/${id}`);
}

export async function checkInMember(id: string) {
  const r = await api.post(`/members/${id}/checkin`);
  return r.data.data;
}

export async function checkOutMember(id: string) {
  await api.post(`/members/${id}/checkout`);
}
