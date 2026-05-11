"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export interface WorkoutExercise {
  id?: string;
  dayNumber: number;
  name: string;
  category?: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  weightKg?: number;
  notes?: string;
  videoUrl?: string;
}

export interface WorkoutPlan {
  id: string;
  gymId: string;
  trainerId?: string;
  memberId?: string;
  name: string;
  description?: string;
  durationWeeks?: number;
  active: boolean;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlanRequest {
  name: string;
  description?: string;
  durationWeeks?: number;
  memberId?: string;
  trainerId?: string;
  active?: boolean;
  exercises: Omit<WorkoutExercise, "id">[];
}

export function useWorkoutPlans(memberId?: string) {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    const qs = memberId ? `?memberId=${memberId}` : "";
    api.get<{ data: WorkoutPlan[] }>(`/workouts${qs}`)
      .then(r => setPlans((r.data.data ?? []).filter(p => p.active)))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [memberId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { plans, loading, refetch: fetch };
}

export function useCreateWorkoutPlan(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (req: WorkoutPlanRequest) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/workouts", req);
      onSuccess();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Failed to create workout plan";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { create, loading, error };
}

export function useUpdateWorkoutPlan(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: string, req: WorkoutPlanRequest) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/workouts/${id}`, req);
      onSuccess();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Failed to update workout plan";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { update, loading, error };
}

export function useDeleteWorkoutPlan(onSuccess: () => void) {
  const [loading, setLoading] = useState(false);

  const deletePlan = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.delete(`/workouts/${id}`);
      onSuccess();
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { deletePlan, loading };
}
