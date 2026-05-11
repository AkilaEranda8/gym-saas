import { renderHook, waitFor } from "@testing-library/react";
import api from "@/lib/axios";

jest.mock("@/lib/axios");
jest.mock("@/lib/auth", () => ({ getAccessToken: jest.fn().mockResolvedValue("token") }));

const mockApi = api as jest.Mocked<typeof api>;

const mockGymSettings = {
  id: "s-1",
  gymId: "g-1",
  gymName: "PowerHouse Gym",
  primaryColor: "#ff6b35",
  secondaryColor: "#1a1a2e",
  timezone: "Asia/Colombo",
  currency: "LKR",
};

const mockFeatureFlags = {
  currentPlan: "PRO",
  features: [
    { featureKey: "CLASS_BOOKING", featureLabel: "Class Booking", isEnabled: true, requiredPlan: "STARTER", isAvailableOnCurrentPlan: true },
    { featureKey: "MULTI_BRANCH", featureLabel: "Multi Branch", isEnabled: false, requiredPlan: "ENTERPRISE", isAvailableOnCurrentPlan: false },
  ],
  enabledCount: 1,
  disabledCount: 1,
};

describe("useGymSettings", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch gym settings on mount", async () => {
    const { useGymSettings } = await import("@/hooks/useSettings");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockGymSettings } });

    const { result } = renderHook(() => useGymSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.settings).toEqual(mockGymSettings);
    expect(result.current.settings?.gymName).toBe("PowerHouse Gym");
    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/settings/gym");
  });

  it("should set error on fetch failure", async () => {
    const { useGymSettings } = await import("@/hooks/useSettings");
    mockApi.get.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useGymSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.settings).toBeNull();
  });
});

describe("useFeatureFlags", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch feature flags", async () => {
    const { useFeatureFlags } = await import("@/hooks/useSettings");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockFeatureFlags } });

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.currentPlan).toBe("PRO");
    expect(result.current.data?.features).toHaveLength(2);
  });

  it("should correctly identify enabled vs disabled features", async () => {
    const { useFeatureFlags } = await import("@/hooks/useSettings");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockFeatureFlags } });

    const { result } = renderHook(() => useFeatureFlags());

    await waitFor(() => expect(result.current.loading).toBe(false));

    const enabled  = result.current.data?.features.filter(f => f.isEnabled);
    const disabled = result.current.data?.features.filter(f => !f.isEnabled);
    expect(enabled).toHaveLength(1);
    expect(disabled).toHaveLength(1);
  });
});

describe("useOperatingHours", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch operating hours", async () => {
    const { useOperatingHours } = await import("@/hooks/useSettings");
    const mockHours = {
      gymId: "g-1",
      schedule: [{ dayOfWeek: 1, dayName: "Monday", isOpen: true, openTime: "06:00", closeTime: "22:00" }],
      isOpenNow: true,
      nextOpenTime: null,
    };
    mockApi.get.mockResolvedValueOnce({ data: { data: mockHours } });

    const { result } = renderHook(() => useOperatingHours());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.isOpenNow).toBe(true);
    expect(result.current.data?.schedule).toHaveLength(1);
  });
});

describe("useMembershipPlans", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch membership plan configurations", async () => {
    const { useMembershipPlans } = await import("@/hooks/useSettings");
    const mockPlans = [
      { id: "p-1", planName: "STANDARD", displayName: "Standard", priceLkr: 350000, durationDays: 30, isActive: true },
      { id: "p-2", planName: "PREMIUM", displayName: "Premium", priceLkr: 650000, durationDays: 30, isActive: true },
    ];
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPlans } });

    const { result } = renderHook(() => useMembershipPlans());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.plans).toHaveLength(2);
    expect(result.current.plans?.[0].planName).toBe("STANDARD");
  });
});
