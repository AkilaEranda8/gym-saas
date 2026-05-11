"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export interface MemberGroup {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  color: string;
  active: boolean;
  memberCount: number;
}

export interface GroupRequest {
  name: string;
  description?: string;
  color: string;
}

export interface DailyWorkout {
  id?: string;
  gymId?: string;
  title: string;
  description?: string;
  workoutDate: string;
  difficulty?: string;
  durationMinutes?: number;
  exercises: string;
  notes?: string;
}

export interface WodRequest {
  title: string;
  description?: string;
  workoutDate: string;
  difficulty?: string;
  durationMinutes?: number;
  exercises: string;
  notes?: string;
}

/* ── Groups ─────────────────────────────────────────────────── */

export function useGroups() {
  const [groups, setGroups] = useState<MemberGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    api.get<{ data: MemberGroup[] }>("/groups")
      .then(r => setGroups(r.data.data ?? []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { groups, loading, refetch: fetch };
}

export function useCreateGroup(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const create = useCallback(async (req: GroupRequest) => {
    setLoading(true);
    try { await api.post("/groups", req); onSuccess(); }
    finally { setLoading(false); }
  }, [onSuccess]);
  return { create, loading };
}

export function useUpdateGroup(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const update = useCallback(async (id: string, req: GroupRequest) => {
    setLoading(true);
    try { await api.put(`/groups/${id}`, req); onSuccess(); }
    finally { setLoading(false); }
  }, [onSuccess]);
  return { update, loading };
}

export function useDeleteGroup(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const deleteGroup = useCallback(async (id: string) => {
    setLoading(true);
    try { await api.delete(`/groups/${id}`); onSuccess(); }
    finally { setLoading(false); }
  }, [onSuccess]);
  return { deleteGroup, loading };
}

export function useGroupMembers(groupId: string | null) {
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(() => {
    if (!groupId) return;
    setLoading(true);
    api.get<{ data: string[] }>(`/groups/${groupId}/members`)
      .then(r => setMemberIds(r.data.data ?? []))
      .catch(() => setMemberIds([]))
      .finally(() => setLoading(false));
  }, [groupId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { memberIds, loading, refetch: fetch };
}

/* ── Daily Workout ───────────────────────────────────────────── */

export function useDailyWorkouts(from: string, to: string) {
  const [wods, setWods] = useState<DailyWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    api.get<{ data: DailyWorkout[] }>(`/daily-workouts?from=${from}&to=${to}`)
      .then(r => setWods(r.data.data ?? []))
      .catch(() => setWods([]))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => { fetch(); }, [fetch]);
  return { wods, loading, refetch: fetch };
}

export function useUpsertWod(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const upsert = useCallback(async (req: WodRequest) => {
    setLoading(true);
    try { await api.post("/daily-workouts", req); onSuccess(); }
    finally { setLoading(false); }
  }, [onSuccess]);
  return { upsert, loading };
}

export function useDeleteWod(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const deleteWod = useCallback(async (id: string) => {
    setLoading(true);
    try { await api.delete(`/daily-workouts/${id}`); onSuccess(); }
    finally { setLoading(false); }
  }, [onSuccess]);
  return { deleteWod, loading };
}
