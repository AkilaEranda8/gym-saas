import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = '/api/v1/nutrition';

// ─── Types ───────────────────────────────────────────────────────────────────

export type NutritionGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE' | 'BODY_RECOMPOSITION' | 'GENERAL_HEALTH' | 'ATHLETIC_PERFORMANCE' | 'VEGAN_PERFORMANCE';
export type FoodCategory = 'PROTEIN' | 'CARBS' | 'VEGETABLES' | 'FRUITS' | 'DAIRY' | 'FATS' | 'SUPPLEMENTS' | 'GRAINS' | 'BEVERAGES' | 'OTHER';
export type MealTimeOfDay = 'BREAKFAST' | 'MID_MORNING' | 'LUNCH' | 'AFTERNOON_SNACK' | 'PRE_WORKOUT' | 'POST_WORKOUT' | 'DINNER' | 'EVENING_SNACK';
export type NutritionAssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type SupplementTiming = 'MORNING' | 'PRE_WORKOUT' | 'POST_WORKOUT' | 'WITH_MEALS' | 'BEFORE_BED' | 'ANYTIME';

export interface MacroBreakdown {
  proteinG: number; proteinPercent: number;
  carbsG: number; carbsPercent: number;
  fatG: number; fatPercent: number;
  totalCalories: number;
}

export interface FoodItem {
  id: string; gymId?: string; name: string; brand?: string;
  category: FoodCategory; categoryColor: string;
  servingSizeG: number; servingUnit: string;
  caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number;
  fiberPer100g?: number; sugarPer100g?: number;
  isCustom: boolean; isVerified: boolean;
  caloriesPerServing: number; proteinPerServing: number; carbsPerServing: number; fatPerServing: number;
}

export interface MealFoodItem {
  id: string; mealId: string; foodItemId?: string;
  foodName: string; foodBrand?: string; foodCategory?: FoodCategory; foodCategoryColor?: string;
  quantityG: number; servingDisplay: string;
  calories: number; proteinG: number; carbsG: number; fatG: number;
  orderIndex: number; notes?: string;
}

export interface MealTemplate {
  id: string; planId: string; mealNumber: number; name: string;
  timeOfDay: MealTimeOfDay; timeOfDayDisplay: string;
  calories?: number; proteinG?: number; carbsG?: number; fatG?: number;
  description?: string; preparationNotes?: string;
  foodItems: MealFoodItem[];
}

export interface NutritionPlan {
  id: string; gymId: string; createdBy?: string;
  name: string; description?: string; goal: NutritionGoal;
  caloriesPerDay: number; proteinG: number; carbsG: number; fatG: number;
  fiberG?: number; waterMl: number; mealsPerDay: number; durationWeeks: number;
  isTemplate: boolean; isActive: boolean;
  tags?: string[]; allergens?: string[];
  mealCount: number; assignedMembersCount: number;
  macroSplit: MacroBreakdown; createdAt: string;
}

export interface NutritionPlanDetail extends NutritionPlan {
  notes?: string; meals: MealTemplate[];
}

export interface NutritionAssignment {
  id: string; gymId: string; memberId: string; planId: string;
  memberName?: string; memberPhone?: string; planName?: string; planGoal?: NutritionGoal;
  assignedBy?: string; startDate: string; endDate?: string;
  status: NutritionAssignmentStatus;
  targetCalories?: number; targetProteinG?: number; targetCarbsG?: number; targetFatG?: number;
  adherencePercent?: number; avgCalories?: number; notes?: string; createdAt: string;
}

export interface LogFoodItem {
  id: string; logMealId: string; foodItemId?: string; foodName: string;
  quantityG: number; calories: number; proteinG: number; carbsG: number; fatG: number;
}

export interface LogMeal {
  id: string; nutritionLogId: string; mealName: string; timeOfDay?: string;
  loggedAt: string; calories: number; proteinG: number; carbsG: number; fatG: number;
  notes?: string; foodItems: LogFoodItem[];
}

export interface NutritionLog {
  id: string; memberId: string; logDate: string;
  totalCalories: number; totalProteinG: number; totalCarbsG: number; totalFatG: number;
  totalFiberG: number; waterMl: number;
  overallFeeling?: number; energyLevel?: number; mealCount: number;
  targetCalories?: number; calorieDeficit?: number; createdAt: string;
}

export interface NutritionLogDetail extends NutritionLog {
  notes?: string; meals: LogMeal[];
  supplements: SupplementSchedule[];
}

export interface WaterLog { id: string; memberId: string; logDate: string; amountMl: number; loggedAt: string; }
export interface DailyWaterSummary { logDate: string; totalMl: number; targetMl: number; percentage: number; logs: WaterLog[]; }

export interface SupplementSchedule {
  id: string; memberId: string; supplementName: string; dosage?: string;
  timing: SupplementTiming; timingDisplay: string; notes?: string; isActive: boolean;
}

export interface NutritionStats {
  totalPlans: number; templatePlans: number; activeAssignments: number;
  logsThisMonth: number; mostUsedPlan?: string; mostPopularGoal?: string; avgAdherence?: number;
}

export interface DailyCalorie { date: string; calories: number; target?: number; deficit?: number; }
export interface NutritionProgress { memberId: string; weeklyCalories: DailyCalorie[]; avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number; avgWater: number; }

export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; first: boolean; last: boolean; }

// ─── Plan Hooks ───────────────────────────────────────────────────────────────

export function useNutritionPlans(params?: { goal?: NutritionGoal; isTemplate?: boolean; search?: string; page?: number; size?: number }) {
  const [data, setData]       = useState<PageResponse<NutritionPlan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (params?.goal)       p.set('goal', params.goal);
      if (params?.isTemplate !== undefined) p.set('isTemplate', String(params.isTemplate));
      if (params?.search)     p.set('search', params.search);
      p.set('page', String(params?.page ?? 0));
      p.set('size', String(params?.size ?? 20));
      const res = await axios.get(`${API}/plans?${p}`);
      setData(res.data.data); setError(null);
    } catch (e: any) { setError(e.response?.data?.message ?? 'Failed to load plans'); }
    finally { setLoading(false); }
  }, [params?.goal, params?.isTemplate, params?.search, params?.page, params?.size]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refresh: fetch };
}

export function useNutritionPlan(id: string | null) {
  const [data, setData]       = useState<NutritionPlanDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`${API}/plans/${id}`)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
}

export function useNutritionTemplates() {
  const [data, setData]       = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/plans/templates`)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useNutritionStats() {
  const [data, setData]       = useState<NutritionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/plans/stats`)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useCreateNutritionPlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const create = async (payload: object) => {
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/plans`, payload);
      return res.data.data as NutritionPlanDetail;
    } catch (e: any) { setError(e.response?.data?.message ?? 'Failed to create plan'); throw e; }
    finally { setLoading(false); }
  };

  return { create, loading, error };
}

export function useUpdateNutritionPlan() {
  const [loading, setLoading] = useState(false);

  const update = async (id: string, payload: object) => {
    setLoading(true);
    try {
      const res = await axios.put(`${API}/plans/${id}`, payload);
      return res.data.data as NutritionPlanDetail;
    } finally { setLoading(false); }
  };

  return { update, loading };
}

export function useDeleteNutritionPlan() {
  const [loading, setLoading] = useState(false);

  const remove = async (id: string) => {
    setLoading(true);
    try { await axios.delete(`${API}/plans/${id}`); }
    finally { setLoading(false); }
  };

  return { remove, loading };
}

// ─── Food Item Hooks ──────────────────────────────────────────────────────────

export function useFoodItems(params?: { category?: FoodCategory; search?: string; page?: number; size?: number }) {
  const [data, setData]       = useState<PageResponse<FoodItem> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (params?.category) p.set('category', params.category);
      if (params?.search)   p.set('search', params.search);
      p.set('page', String(params?.page ?? 0));
      p.set('size', String(params?.size ?? 20));
      const res = await axios.get(`${API}/foods?${p}`);
      setData(res.data.data);
    } finally { setLoading(false); }
  }, [params?.category, params?.search, params?.page, params?.size]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}

export function useSearchFoodItems() {
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${API}/foods/search?q=${encodeURIComponent(q)}`);
      setResults(res.data.data);
    } finally { setLoading(false); }
  };

  return { results, loading, search };
}

export function useCreateFoodItem() {
  const [loading, setLoading] = useState(false);

  const create = async (payload: object) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/foods`, payload);
      return res.data.data as FoodItem;
    } finally { setLoading(false); }
  };

  return { create, loading };
}

// ─── Assignment Hooks ─────────────────────────────────────────────────────────

export function useNutritionAssignments(params?: { status?: NutritionAssignmentStatus; planId?: string; page?: number; size?: number }) {
  const [data, setData]       = useState<PageResponse<NutritionAssignment> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (params?.status) p.set('status', params.status);
      if (params?.planId) p.set('planId', params.planId);
      p.set('page', String(params?.page ?? 0));
      p.set('size', String(params?.size ?? 20));
      const res = await axios.get(`${API}/assignments?${p}`);
      setData(res.data.data);
    } finally { setLoading(false); }
  }, [params?.status, params?.planId, params?.page, params?.size]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}

export function useActiveAssignment(memberId: string | null) {
  const [data, setData]       = useState<NutritionAssignment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    axios.get(`${API}/assignments/member/${memberId}/active`)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [memberId]);

  return { data, loading };
}

export function useAssignNutritionPlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const assign = async (payload: object) => {
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/assignments`, payload);
      return res.data.data as NutritionAssignment;
    } catch (e: any) { setError(e.response?.data?.message ?? 'Failed to assign plan'); throw e; }
    finally { setLoading(false); }
  };

  return { assign, loading, error };
}

export function useUpdateAssignmentStatus() {
  const [loading, setLoading] = useState(false);

  const update = async (id: string, status: NutritionAssignmentStatus) => {
    setLoading(true);
    try {
      const res = await axios.patch(`${API}/assignments/${id}/status?status=${status}`);
      return res.data.data as NutritionAssignment;
    } finally { setLoading(false); }
  };

  return { update, loading };
}

// ─── Log Hooks ────────────────────────────────────────────────────────────────

export function useTodayNutritionLog(memberId: string | null) {
  const [data, setData]       = useState<NutritionLogDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/logs/today?memberId=${memberId}`);
      setData(res.data.data);
    } finally { setLoading(false); }
  }, [memberId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}

export function useNutritionLogByDate(memberId: string | null, date: string | null) {
  const [data, setData]       = useState<NutritionLogDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId || !date) return;
    setLoading(true);
    axios.get(`${API}/logs/date?memberId=${memberId}&date=${date}`)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [memberId, date]);

  return { data, loading };
}

export function useNutritionLogs(memberId: string | null, params?: { from?: string; to?: string; page?: number; size?: number }) {
  const [data, setData]       = useState<PageResponse<NutritionLog> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    const p = new URLSearchParams({ memberId });
    if (params?.from) p.set('from', params.from);
    if (params?.to)   p.set('to', params.to);
    p.set('page', String(params?.page ?? 0));
    p.set('size', String(params?.size ?? 30));
    axios.get(`${API}/logs?${p}`)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [memberId, params?.from, params?.to, params?.page]);

  return { data, loading };
}

export function useLogNutrition() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const log = async (memberId: string, payload: object) => {
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/logs?memberId=${memberId}`, payload);
      return res.data.data as NutritionLogDetail;
    } catch (e: any) { setError(e.response?.data?.message ?? 'Failed to log nutrition'); throw e; }
    finally { setLoading(false); }
  };

  return { log, loading, error };
}

export function useNutritionProgress(memberId: string | null, from: string, to: string) {
  const [data, setData]       = useState<NutritionProgress | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    axios.get(`${API}/logs/progress?memberId=${memberId}&from=${from}&to=${to}`)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [memberId, from, to]);

  return { data, loading };
}

// ─── Water Hooks ──────────────────────────────────────────────────────────────

export function useWaterSummary(memberId: string | null, date?: string) {
  const [data, setData]       = useState<DailyWaterSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ memberId });
      if (date) p.set('date', date);
      const res = await axios.get(`${API}/logs/water?${p}`);
      setData(res.data.data);
    } finally { setLoading(false); }
  }, [memberId, date]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}

export function useLogWater() {
  const [loading, setLoading] = useState(false);

  const log = async (memberId: string, amountMl: number, logDate?: string) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/logs/water?memberId=${memberId}`, { amountMl, logDate });
      return res.data.data as WaterLog;
    } finally { setLoading(false); }
  };

  return { log, loading };
}

// ─── Supplement Hooks ─────────────────────────────────────────────────────────

export function useSupplements(memberId: string | null) {
  const [data, setData]       = useState<SupplementSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/supplements?memberId=${memberId}`);
      setData(res.data.data);
    } finally { setLoading(false); }
  }, [memberId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refresh: fetch };
}

export function useAddSupplement() {
  const [loading, setLoading] = useState(false);

  const add = async (memberId: string, payload: object) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/supplements?memberId=${memberId}`, payload);
      return res.data.data as SupplementSchedule;
    } finally { setLoading(false); }
  };

  return { add, loading };
}

export function useDeleteSupplement() {
  const [loading, setLoading] = useState(false);

  const remove = async (id: string) => {
    setLoading(true);
    try { await axios.delete(`${API}/supplements/${id}`); }
    finally { setLoading(false); }
  };

  return { remove, loading };
}
