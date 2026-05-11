"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────

export type WorkoutGoal =
  | "WEIGHT_LOSS" | "MUSCLE_GAIN" | "STRENGTH" | "ENDURANCE"
  | "FLEXIBILITY" | "GENERAL_FITNESS" | "REHABILITATION" | "ATHLETIC";

export type WorkoutLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";

export type ExerciseCategory =
  | "CHEST" | "BACK" | "SHOULDERS" | "ARMS" | "LEGS"
  | "CORE" | "CARDIO" | "FULL_BODY" | "FLEXIBILITY" | "OTHER";

export type ExerciseEquipment =
  | "BARBELL" | "DUMBBELL" | "MACHINE" | "CABLE" | "BODYWEIGHT"
  | "RESISTANCE_BAND" | "KETTLEBELL" | "OTHER" | "NONE";

export type AssignmentStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
export type WorkoutLogStatus = "COMPLETED" | "SKIPPED" | "PARTIAL";
export type PersonalRecordType = "ONE_REP_MAX" | "MAX_REPS" | "MAX_WEIGHT" | "BEST_TIME";

export interface Exercise {
  id: string;
  gymId?: string;
  name: string;
  description?: string;
  category: ExerciseCategory;
  muscleGroups?: string[];
  equipment?: ExerciseEquipment;
  difficulty?: WorkoutLevel;
  instructions?: string;
  tips?: string;
  videoUrl?: string;
  imageUrl?: string;
  custom: boolean;
  createdAt: string;
}

export interface WorkoutExerciseItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: ExerciseCategory;
  exerciseEquipment?: ExerciseEquipment;
  orderIndex: number;
  sets?: number;
  reps?: string;
  durationSeconds?: number;
  restSeconds?: number;
  weightNote?: string;
  tempo?: string;
  rpe?: number;
  notes?: string;
  superset: boolean;
  supersetGroup?: number;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  name?: string;
  focus?: string;
  notes?: string;
  estimatedMinutes?: number;
  exercises: WorkoutExerciseItem[];
}

export interface WorkoutPlan {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  goal: WorkoutGoal;
  level: WorkoutLevel;
  daysPerWeek: number;
  durationWeeks: number;
  durationMinutes: number;
  template: boolean;
  active: boolean;
  tags?: string[];
  equipmentNeeded?: string[];
  notes?: string;
  createdBy?: string;
  createdAt: string;
  dayCount: number;
}

export interface WorkoutPlanDetail extends Omit<WorkoutPlan, "dayCount"> {
  days: WorkoutDay[];
}

export interface WorkoutAssignment {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  planGoal: WorkoutGoal;
  planLevel: WorkoutLevel;
  assignedBy?: string;
  startDate: string;
  endDate?: string;
  status: AssignmentStatus;
  currentWeek: number;
  notes?: string;
  createdAt: string;
}

export interface WorkoutSetLog {
  id: string;
  workoutExerciseId: string;
  exerciseId: string;
  exerciseName?: string;
  setNumber: number;
  repsCompleted?: number;
  weightKg?: number;
  durationSeconds?: number;
  rpeActual?: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  memberId: string;
  assignmentId?: string;
  planId?: string;
  planName?: string;
  dayId?: string;
  dayName?: string;
  logDate: string;
  startedAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  status: WorkoutLogStatus;
  overallFeeling?: number;
  notes?: string;
  createdAt: string;
  setLogs: WorkoutSetLog[];
}

export interface PersonalRecord {
  id: string;
  memberId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: ExerciseCategory;
  recordType: PersonalRecordType;
  value: number;
  unit?: string;
  achievedDate: string;
  notes?: string;
  createdAt: string;
}

export interface WorkoutStats {
  totalPlans: number;
  activeAssignments: number;
  totalSessionsThisMonth: number;
  totalMinutesThisMonth: number;
  totalPRs: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ── Workout Plans ─────────────────────────────────────────────

export function useWorkoutPlans(params?: {
  goal?: WorkoutGoal; level?: WorkoutLevel; search?: string; page?: number; size?: number;
}) {
  const [data, setData] = useState<PageResponse<WorkoutPlan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/workouts", { params });
      setData(res.data.data);
    } catch {
      setError("Failed to load workout plans");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

export function useWorkoutTemplates() {
  const [data, setData] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/workouts/templates")
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useWorkoutPlan(id: string | null) {
  const [data, setData] = useState<WorkoutPlanDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/workouts/${id}`);
      setData(res.data.data);
    } catch {
      setError("Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

export function useCreateWorkoutPlan() {
  const [loading, setLoading] = useState(false);
  const create = async (body: object) => {
    setLoading(true);
    try {
      const res = await api.post("/workouts", body);
      return res.data.data as WorkoutPlanDetail;
    } finally {
      setLoading(false);
    }
  };
  return { create, loading };
}

export function useUpdateWorkoutPlan() {
  const [loading, setLoading] = useState(false);
  const update = async (id: string, body: object) => {
    setLoading(true);
    try {
      const res = await api.put(`/workouts/${id}`, body);
      return res.data.data as WorkoutPlanDetail;
    } finally {
      setLoading(false);
    }
  };
  return { update, loading };
}

export function useDeleteWorkoutPlan() {
  const [loading, setLoading] = useState(false);
  const remove = async (id: string) => {
    setLoading(true);
    try {
      await api.delete(`/workouts/${id}`);
    } finally {
      setLoading(false);
    }
  };
  return { remove, loading };
}

// ── Exercises ─────────────────────────────────────────────────

export function useExercises(params?: {
  category?: ExerciseCategory; equipment?: ExerciseEquipment; search?: string; page?: number; size?: number;
}) {
  const [data, setData] = useState<PageResponse<Exercise> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/exercises", { params });
      setData(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, refetch: load };
}

export function useAllExercises() {
  const [data, setData] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/exercises/all")
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useCreateExercise() {
  const [loading, setLoading] = useState(false);
  const create = async (body: object) => {
    setLoading(true);
    try {
      const res = await api.post("/exercises", body);
      return res.data.data as Exercise;
    } finally {
      setLoading(false);
    }
  };
  return { create, loading };
}

// ── Assignments ───────────────────────────────────────────────

export function useMemberAssignments(memberId: string | null) {
  const [data, setData] = useState<WorkoutAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const res = await api.get(`/workout-assignments/member/${memberId}`);
      setData(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, refetch: load };
}

export function useActiveAssignment(memberId: string | null) {
  const [data, setData] = useState<WorkoutAssignment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    api.get(`/workout-assignments/member/${memberId}/active`)
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [memberId]);

  return { data, loading };
}

export function useAssignWorkout() {
  const [loading, setLoading] = useState(false);
  const assign = async (body: { memberId: string; planId: string; startDate: string; endDate?: string; notes?: string }) => {
    setLoading(true);
    try {
      const res = await api.post("/workout-assignments", body);
      return res.data.data as WorkoutAssignment;
    } finally {
      setLoading(false);
    }
  };
  return { assign, loading };
}

export function useUpdateAssignmentStatus() {
  const [loading, setLoading] = useState(false);
  const update = async (id: string, status: AssignmentStatus) => {
    setLoading(true);
    try {
      const res = await api.patch(`/workout-assignments/${id}/status`, { status });
      return res.data.data as WorkoutAssignment;
    } finally {
      setLoading(false);
    }
  };
  return { update, loading };
}

// ── Workout Logs ──────────────────────────────────────────────

export function useMemberWorkoutLogs(memberId: string | null, page = 0, size = 20) {
  const [data, setData] = useState<PageResponse<WorkoutLog> | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const res = await api.get(`/workout-logs/member/${memberId}`, { params: { page, size } });
      setData(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [memberId, page, size]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, refetch: load };
}

export function useWorkoutLogRange(memberId: string | null, from: string | null, to: string | null) {
  const [data, setData] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId || !from || !to) return;
    setLoading(true);
    api.get(`/workout-logs/member/${memberId}/range`, { params: { from, to } })
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [memberId, from, to]);

  return { data, loading };
}

export function useWorkoutStats(memberId: string | null) {
  const [data, setData] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    api.get(`/workout-logs/member/${memberId}/stats`)
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [memberId]);

  return { data, loading };
}

export function useCreateWorkoutLog() {
  const [loading, setLoading] = useState(false);
  const create = async (memberId: string, body: object) => {
    setLoading(true);
    try {
      const res = await api.post(`/workout-logs/member/${memberId}`, body);
      return res.data.data as WorkoutLog;
    } finally {
      setLoading(false);
    }
  };
  return { create, loading };
}

// ── Personal Records ──────────────────────────────────────────

export function usePersonalRecords(memberId: string | null) {
  const [data, setData] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const res = await api.get(`/personal-records/member/${memberId}`);
      setData(res.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, refetch: load };
}

export function useSavePersonalRecord() {
  const [loading, setLoading] = useState(false);
  const save = async (memberId: string, body: object) => {
    setLoading(true);
    try {
      const res = await api.post(`/personal-records/member/${memberId}`, body);
      return res.data.data as PersonalRecord;
    } finally {
      setLoading(false);
    }
  };
  return { save, loading };
}
