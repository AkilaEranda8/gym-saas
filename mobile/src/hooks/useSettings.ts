import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface GymSettingsDTO {
  gymName: string;
  tagline?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  email?: string;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  language: string;
  addressLine1?: string;
  city?: string;
  district?: string;
}

export interface DayScheduleDTO {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

export interface OperatingHoursDTO {
  schedule: DayScheduleDTO[];
  isOpenNow: boolean;
  nextOpenTime?: string;
}

export interface HolidayDTO {
  id: string;
  name: string;
  holidayDate: string;
  isClosed: boolean;
  isToday: boolean;
  isRecurring: boolean;
}

export interface MembershipPlanConfigDTO {
  id: string;
  planName: string;
  displayName: string;
  priceLkr: number;
  priceFormatted: string;
  durationDays: number;
  color?: string;
  description?: string;
  features: string[];
  lockerIncluded: boolean;
  maxClassesPerWeek: number;
  maxPtSessions: number;
  isActive: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: T }>(url);
      setData(res.data.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ── Hooks ─────────────────────────────────────────────────────────────────

export function useGymSettings() {
  return useFetch<GymSettingsDTO>("/api/v1/settings/gym");
}

export function useOperatingHours() {
  return useFetch<OperatingHoursDTO>("/api/v1/settings/hours");
}

export function useUpcomingHolidays() {
  return useFetch<HolidayDTO[]>("/api/v1/settings/hours/holidays");
}

export function useMembershipPlans() {
  return useFetch<MembershipPlanConfigDTO[]>("/api/v1/settings/plans");
}

export function useIsOpenNow() {
  const [open, setOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    try {
      const res = await api.get<{ data: { isOpen: boolean } }>("/api/v1/settings/hours/is-open");
      setOpen(res.data.data.isOpen);
    } catch { setOpen(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { check(); }, [check]);
  return { open, loading, refetch: check };
}
