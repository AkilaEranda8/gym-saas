import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type NutritionGoal = "WEIGHT_LOSS" | "MUSCLE_GAIN" | "MAINTENANCE" | "BODY_RECOMPOSITION" | "GENERAL_HEALTH" | "ATHLETIC_PERFORMANCE" | "VEGAN_PERFORMANCE";
export type MealTimeOfDay = "BREAKFAST" | "MID_MORNING" | "LUNCH" | "AFTERNOON_SNACK" | "PRE_WORKOUT" | "POST_WORKOUT" | "DINNER" | "EVENING_SNACK";
export type SupplementTiming = "MORNING" | "PRE_WORKOUT" | "POST_WORKOUT" | "WITH_MEALS" | "BEFORE_BED" | "ANYTIME";

export interface MacroBreakdown {
  proteinG: number; proteinPercent: number;
  carbsG: number; carbsPercent: number;
  fatG: number; fatPercent: number;
  totalCalories: number;
}

export interface NutritionAssignment {
  id: string; memberId: string; planId: string;
  planName?: string; planGoal?: NutritionGoal;
  startDate: string; endDate?: string; status: string;
  targetCalories?: number; targetProteinG?: number; targetCarbsG?: number; targetFatG?: number;
  notes?: string;
}

export interface LogFoodItem {
  id: string; foodName: string; quantityG: number;
  calories: number; proteinG: number; carbsG: number; fatG: number;
}

export interface LogMeal {
  id: string; mealName: string; timeOfDay?: string;
  loggedAt: string; calories: number; proteinG: number; carbsG: number; fatG: number;
  notes?: string; foodItems: LogFoodItem[];
}

export interface NutritionLogDetail {
  id: string; memberId: string; logDate: string;
  totalCalories: number; totalProteinG: number; totalCarbsG: number; totalFatG: number;
  waterMl: number; overallFeeling?: number; energyLevel?: number;
  mealCount: number; targetCalories?: number; calorieDeficit?: number;
  meals: LogMeal[]; supplements: SupplementSchedule[];
}

export interface DailyWaterSummary {
  logDate: string; totalMl: number; targetMl: number; percentage: number;
}

export interface SupplementSchedule {
  id: string; supplementName: string; dosage?: string;
  timing: SupplementTiming; timingDisplay: string; notes?: string; isActive: boolean;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useActiveNutritionAssignment(memberId: string | null) {
  const [assignment, setAssignment] = useState<NutritionAssignment | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!memberId) return;
    setIsLoading(true); setError(null);
    try {
      const { data } = await api.get(`/nutrition/assignments/member/${memberId}/active`);
      setAssignment(data.data ?? null);
    } catch (e: any) {
      if (e?.response?.status !== 404) setError("Failed to load assignment");
      setAssignment(null);
    } finally { setIsLoading(false); }
  }, [memberId]);

  useEffect(() => { refetch(); }, [refetch]);
  return { assignment, isLoading, error, refetch };
}

export function useTodayNutritionLog(memberId: string | null) {
  const [log, setLog]             = useState<NutritionLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!memberId) return;
    setIsLoading(true); setError(null);
    try {
      const { data } = await api.get(`/nutrition/logs/today?memberId=${memberId}`);
      setLog(data.data ?? null);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load today's log");
    } finally { setIsLoading(false); }
  }, [memberId]);

  useEffect(() => { refetch(); }, [refetch]);
  return { log, isLoading, error, refetch };
}

export function useWaterSummary(memberId: string | null, date?: string) {
  const [summary, setSummary]     = useState<DailyWaterSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!memberId) return;
    setIsLoading(true);
    try {
      const q = date ? `&date=${date}` : "";
      const { data } = await api.get(`/nutrition/logs/water?memberId=${memberId}${q}`);
      setSummary(data.data ?? null);
    } catch { setSummary(null); }
    finally { setIsLoading(false); }
  }, [memberId, date]);

  useEffect(() => { refetch(); }, [refetch]);
  return { summary, isLoading, refetch };
}

export function useLogWater() {
  const [isLoading, setIsLoading] = useState(false);

  const logWater = async (memberId: string, amountMl: number) => {
    setIsLoading(true);
    try {
      await api.post(`/nutrition/logs/water?memberId=${memberId}`, { amountMl });
      return true;
    } catch { return false; }
    finally { setIsLoading(false); }
  };

  return { logWater, isLoading };
}

export function useSupplements(memberId: string | null) {
  const [supplements, setSupplements] = useState<SupplementSchedule[]>([]);
  const [isLoading, setIsLoading]     = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setIsLoading(true);
    api.get(`/nutrition/supplements?memberId=${memberId}`)
      .then((r: { data: { data: SupplementSchedule[] } }) => setSupplements(r.data.data ?? []))
      .catch(() => setSupplements([]))
      .finally(() => setIsLoading(false));
  }, [memberId]);

  return { supplements, isLoading };
}
