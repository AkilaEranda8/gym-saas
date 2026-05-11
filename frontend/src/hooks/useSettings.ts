"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GymSettingsDTO {
  id: string;
  gymId: string;
  gymName: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  whatsappNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  googleMapsUrl?: string;
  businessRegNo?: string;
  taxNo?: string;
  operatingHours?: Record<string, unknown>;
  primaryColor: string;
  secondaryColor: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  invoicePrefix: string;
  invoiceFooter?: string;
  invoiceTerms?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  updatedAt?: string;
}

export interface SettingKVDTO {
  key: string;
  value: string;
  valueType: string;
  category: string;
  description?: string;
  isSensitive: boolean;
}

export interface SettingsByCategoryDTO {
  category: string;
  categoryLabel: string;
  settings: SettingKVDTO[];
}

export interface IntegrationDTO {
  id: string;
  gymId: string;
  provider: string;
  providerLabel: string;
  isEnabled: boolean;
  testMode: boolean;
  config: Record<string, string>;
  lastTestedAt?: string;
  lastTestStatus: string;
  lastTestMessage?: string;
  isConfigured: boolean;
}

export interface IntegrationTestResultDTO {
  provider: string;
  status: string;
  message: string;
  responseTimeMs: number;
  testedAt: string;
}

export interface MembershipPlanConfigDTO {
  id: string;
  gymId: string;
  planName: string;
  displayName: string;
  priceLkr: number;
  priceFormatted: string;
  durationDays: number;
  durationLabel: string;
  color?: string;
  description?: string;
  features: string[];
  maxClassesPerWeek: number;
  maxPtSessions: number;
  lockerIncluded: boolean;
  guestPasses: number;
  discountPct: number;
  isActive: boolean;
  sortOrder: number;
}

export interface DayScheduleDTO {
  dayOfWeek: number;
  dayName: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  notes?: string;
}

export interface OperatingHoursDTO {
  gymId: string;
  branchId?: string;
  schedule: DayScheduleDTO[];
  isOpenNow: boolean;
  nextOpenTime?: string;
}

export interface HolidayDTO {
  id: string;
  gymId: string;
  name: string;
  holidayDate: string;
  isClosed: boolean;
  openTime?: string;
  closeTime?: string;
  notes?: string;
  isRecurring: boolean;
  isToday: boolean;
  isPast: boolean;
}

export interface FeatureFlagDTO {
  featureKey: string;
  featureLabel: string;
  description: string;
  isEnabled: boolean;
  enabledByPlan: boolean;
  requiredPlan: string;
  isAvailableOnCurrentPlan: boolean;
  overrideByAdmin: boolean;
}

export interface AllFeaturesDTO {
  currentPlan: string;
  features: FeatureFlagDTO[];
  enabledCount: number;
  disabledCount: number;
}

export interface AuditSettingsDTO {
  retainDays: number;
  logLogins: boolean;
  logDataExports: boolean;
  logPaymentActions: boolean;
  ipRestrictionEnabled: boolean;
  allowedIps: string[];
}

export interface LoginHistoryDTO {
  id: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  deviceType?: string;
  location?: string;
  status: string;
  failureReason?: string;
  loggedAt: string;
  isSuspicious: boolean;
}

export interface SecuritySummaryDTO {
  loginAttemptsToday: number;
  failedLoginsToday: number;
  blockedAttempts: number;
  uniqueIpsToday: number;
  suspiciousActivity: LoginHistoryDTO[];
  recentLogins: LoginHistoryDTO[];
}

export interface FullSettingsDTO {
  gymSettings: GymSettingsDTO;
  byCategory: SettingsByCategoryDTO[];
  integrations: IntegrationDTO[];
  membershipPlans: MembershipPlanConfigDTO[];
  operatingHours: OperatingHoursDTO;
  upcomingHolidays: HolidayDTO[];
  features: AllFeaturesDTO;
  auditSettings: AuditSettingsDTO;
}

// ── Helper ────────────────────────────────────────────────────────────────────

function useFetch<T>(url: string, deps: unknown[] = []) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useGymSettings() {
  return useFetch<GymSettingsDTO>("/settings/gym");
}

export function useFullSettings() {
  return useFetch<FullSettingsDTO>("/settings");
}

export function useSettingsKV() {
  return useFetch<SettingsByCategoryDTO[]>("/settings/kv");
}

export function useIntegrations() {
  return useFetch<IntegrationDTO[]>("/settings/integrations");
}

export function useIntegration(provider: string) {
  return useFetch<IntegrationDTO>(`/settings/integrations/${provider}`, [provider]);
}

export function useMembershipPlans() {
  return useFetch<MembershipPlanConfigDTO[]>("/settings/plans");
}

export function useOperatingHours(branchId?: string) {
  const url = branchId ? `/settings/hours?branchId=${branchId}` : "/settings/hours";
  return useFetch<OperatingHoursDTO>(url, [branchId]);
}

export function useHolidays() {
  return useFetch<HolidayDTO[]>("/settings/hours/holidays");
}

export function useFeatureFlags() {
  return useFetch<AllFeaturesDTO>("/settings/features");
}

export function useSecuritySummary() {
  return useFetch<SecuritySummaryDTO>("/settings/security/summary");
}

export function useLoginHistory(filters: { userId?: string; status?: string; page?: number; size?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.status) params.set("status", filters.status);
  if (filters.page !== undefined) params.set("page", String(filters.page));
  if (filters.size !== undefined) params.set("size", String(filters.size));
  const url = `/settings/security/login-history?${params.toString()}`;
  return useFetch<{ content: LoginHistoryDTO[]; totalElements: number }>(url, [JSON.stringify(filters)]);
}

export function useAuditSettings() {
  return useFetch<AuditSettingsDTO>("/settings/security/audit-settings");
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useUpdateGymSettings() {
  const [saving, setSaving] = useState(false);
  const mutate = async (req: Partial<GymSettingsDTO>) => {
    setSaving(true);
    try {
      const res = await api.put<{ data: GymSettingsDTO }>("/settings/gym", req);
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}

export function useUpdateTheme() {
  const [saving, setSaving] = useState(false);
  const mutate = async (req: { primaryColor: string; secondaryColor: string }) => {
    setSaving(true);
    try {
      const res = await api.put<{ data: GymSettingsDTO }>("/settings/theme", req);
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}

export function useUploadLogo() {
  const [uploading, setUploading] = useState(false);
  const mutate = async (file: File, isCover = false) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const endpoint = isCover ? "/settings/cover-image" : "/settings/logo";
      const res = await api.post<{ data: { url: string } }>(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data.url;
    } finally { setUploading(false); }
  };
  return { mutate, uploading };
}

export function useUpdateSettingsKV() {
  const [saving, setSaving] = useState(false);
  const mutate = async (values: Record<string, string>) => {
    setSaving(true);
    try {
      const res = await api.put<{ data: SettingsByCategoryDTO[] }>("/settings/kv", values);
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}

export function useUpdateIntegration() {
  const [saving, setSaving] = useState(false);
  const mutate = async (provider: string, req: { isEnabled?: boolean; testMode?: boolean; config?: Record<string, string> }) => {
    setSaving(true);
    try {
      const res = await api.put<{ data: IntegrationDTO }>(`/settings/integrations/${provider}`, req);
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}

export function useTestIntegration() {
  const [testing, setTesting] = useState(false);
  const mutate = async (provider: string) => {
    setTesting(true);
    try {
      const res = await api.post<{ data: IntegrationTestResultDTO }>(`/settings/integrations/${provider}/test`);
      return res.data.data;
    } finally { setTesting(false); }
  };
  return { mutate, testing };
}

export function useUpdatePlan() {
  const [saving, setSaving] = useState(false);
  const mutate = async (planName: string, req: Partial<MembershipPlanConfigDTO> & { features?: string[] }) => {
    setSaving(true);
    try {
      const res = await api.put<{ data: MembershipPlanConfigDTO }>(`/settings/plans/${planName}`, req);
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}

export function useUpdateOperatingHours() {
  const [saving, setSaving] = useState(false);
  const mutate = async (req: { hours: DayScheduleDTO[] }, branchId?: string) => {
    setSaving(true);
    try {
      const url = branchId ? `/settings/hours?branchId=${branchId}` : "/settings/hours";
      const res = await api.put<{ data: OperatingHoursDTO }>(url, req);
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}

export function useCreateHoliday() {
  const [saving, setSaving] = useState(false);
  const mutate = async (req: Partial<HolidayDTO>) => {
    setSaving(true);
    try {
      const res = await api.post<{ data: HolidayDTO }>("/settings/hours/holidays", req);
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}

export function useDeleteHoliday() {
  const [deleting, setDeleting] = useState(false);
  const mutate = async (id: string) => {
    setDeleting(true);
    try { await api.delete(`/settings/hours/holidays/${id}`); }
    finally { setDeleting(false); }
  };
  return { mutate, deleting };
}

export function useUpdateFeatureFlags() {
  const [saving, setSaving] = useState(false);
  const mutate = async (flags: Record<string, boolean>) => {
    setSaving(true);
    try {
      const res = await api.put<{ data: AllFeaturesDTO }>("/settings/features", { flags });
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}

export function useUpdateAuditSettings() {
  const [saving, setSaving] = useState(false);
  const mutate = async (req: Partial<AuditSettingsDTO>) => {
    setSaving(true);
    try {
      const res = await api.put<{ data: AuditSettingsDTO }>("/settings/security/audit-settings", req);
      return res.data.data;
    } finally { setSaving(false); }
  };
  return { mutate, saving };
}
