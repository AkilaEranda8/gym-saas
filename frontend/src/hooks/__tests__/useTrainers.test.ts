import { renderHook, waitFor } from "@testing-library/react";
import api from "@/lib/axios";

jest.mock("@/lib/axios");
jest.mock("@/lib/auth", () => ({ getAccessToken: jest.fn().mockResolvedValue("token") }));

const mockApi = api as jest.Mocked<typeof api>;

const mockTrainer = {
  id: "t-1",
  gymId: "g-1",
  name: "Ruwan Fonseka",
  email: "ruwan@gym.lk",
  status: "ACTIVE" as const,
  employmentType: "FULL_TIME" as const,
  specialties: ["STRENGTH", "HIIT"],
  experienceYears: 5,
  rating: "4.8",
  totalReviews: 32,
  activeClientsCount: 12,
  classesThisWeek: 8,
  joinedDate: "2022-03-15",
};

const mockPage = {
  content: [mockTrainer],
  totalPages: 1,
  totalElements: 1,
  number: 0,
};

const mockStats = {
  totalTrainers: 10,
  activeTrainers: 8,
  onLeaveToday: 1,
  averageRating: 4.7,
  totalActivePTClients: 45,
  topRatedTrainerName: "Ruwan Fonseka",
  topRatedTrainerRating: 4.8,
  mostActiveTrainerName: "Ruwan Fonseka",
  mostActiveTrainerSessions: 8,
};

describe("useTrainers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch trainers on mount", async () => {
    const { useTrainers } = await import("@/hooks/useTrainers");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPage } });

    const { result } = renderHook(() => useTrainers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.content).toHaveLength(1);
    expect(result.current.data?.content[0].name).toBe("Ruwan Fonseka");
    expect(result.current.error).toBeNull();
  });

  it("should set error message on failure", async () => {
    const { useTrainers } = await import("@/hooks/useTrainers");
    mockApi.get.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useTrainers());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load trainers");
    expect(result.current.data).toBeNull();
  });

  it("should filter by status param", async () => {
    const { useTrainers } = await import("@/hooks/useTrainers");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPage } });

    renderHook(() => useTrainers({ status: "ACTIVE" }));

    await waitFor(() => {});

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/v1/trainers",
      expect.objectContaining({ params: expect.objectContaining({ status: "ACTIVE" }) })
    );
  });

  it("should filter by specialty param", async () => {
    const { useTrainers } = await import("@/hooks/useTrainers");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPage } });

    renderHook(() => useTrainers({ specialty: "STRENGTH" }));

    await waitFor(() => {});

    expect(mockApi.get).toHaveBeenCalledWith(
      "/api/v1/trainers",
      expect.objectContaining({ params: expect.objectContaining({ specialty: "STRENGTH" }) })
    );
  });
});

describe("useTrainerStats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch trainer stats", async () => {
    const { useTrainerStats } = await import("@/hooks/useTrainers");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockStats } });

    const { result } = renderHook(() => useTrainerStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.totalTrainers).toBe(10);
    expect(result.current.data?.averageRating).toBe(4.7);
    expect(result.current.data?.topRatedTrainerName).toBe("Ruwan Fonseka");
  });
});
