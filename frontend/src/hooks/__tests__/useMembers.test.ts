import { renderHook, waitFor, act } from "@testing-library/react";
import api from "@/lib/axios";
import { useMembers, useMember, useMemberStats, createMember, deleteMember } from "@/hooks/useMembers";

jest.mock("@/lib/axios");
const mockApi = api as jest.Mocked<typeof api>;

jest.mock("@/lib/auth", () => ({
  getAccessToken: jest.fn().mockResolvedValue("mock-token"),
}));

const mockMember = {
  id: "member-1",
  gymId: "gym-1",
  firstName: "Kamal",
  lastName: "Perera",
  fullName: "Kamal Perera",
  email: "kamal@test.lk",
  status: "ACTIVE" as const,
  joinDate: "2024-01-01",
  createdAt: "2024-01-01T00:00:00Z",
};

const mockPage = {
  content: [mockMember],
  totalPages: 1,
  totalElements: 1,
  number: 0,
};

describe("useMembers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch members on mount", async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPage } });

    const { result } = renderHook(() => useMembers());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockPage);
    expect(result.current.data?.content).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining("/api/v1/members"));
  });

  it("should set error state on fetch failure", async () => {
    mockApi.get.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useMembers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Network error");
    expect(result.current.data).toBeNull();
  });

  it("should include search param when provided", async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPage } });

    renderHook(() => useMembers({ search: "Kamal", page: 0, size: 10 }));

    await waitFor(() => {});

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("search=Kamal")
    );
    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("page=0")
    );
    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("size=10")
    );
  });

  it("should include status filter when provided", async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPage } });

    renderHook(() => useMembers({ status: "ACTIVE" }));

    await waitFor(() => {});

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("status=ACTIVE")
    );
  });

  it("should refetch when refetch is called", async () => {
    mockApi.get.mockResolvedValue({ data: { data: mockPage } });

    const { result } = renderHook(() => useMembers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockApi.get).toHaveBeenCalledTimes(1);

    act(() => { result.current.refetch(); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockApi.get).toHaveBeenCalledTimes(2);
  });
});

describe("useMember", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch single member by id", async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: mockMember } });

    const { result } = renderHook(() => useMember("member-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.member).toEqual(mockMember);
    expect(mockApi.get).toHaveBeenCalledWith("/api/v1/members/member-1");
  });

  it("should not fetch when id is empty", async () => {
    const { result } = renderHook(() => useMember(""));

    await waitFor(() => {});

    expect(mockApi.get).not.toHaveBeenCalled();
  });
});

describe("useMemberStats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch stats on mount", async () => {
    const mockStats = { totalMembers: 100, activeMembers: 80, expiringThisWeek: 5, expiredMembers: 10, checkedInToday: 20, newThisMonth: 8 };
    mockApi.get.mockResolvedValueOnce({ data: { data: mockStats } });

    const { result } = renderHook(() => useMemberStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toEqual(mockStats);
  });
});

describe("createMember", () => {
  it("should POST to members endpoint", async () => {
    mockApi.post.mockResolvedValueOnce({ data: { data: mockMember } });

    const result = await createMember({ firstName: "Kamal", lastName: "Perera", email: "kamal@test.lk" });

    expect(result).toEqual(mockMember);
    expect(mockApi.post).toHaveBeenCalledWith("/api/v1/members", expect.objectContaining({ firstName: "Kamal" }));
  });
});

describe("deleteMember", () => {
  it("should DELETE member by id", async () => {
    mockApi.delete.mockResolvedValueOnce({ data: {} });

    await deleteMember("member-1");

    expect(mockApi.delete).toHaveBeenCalledWith("/api/v1/members/member-1");
  });
});
