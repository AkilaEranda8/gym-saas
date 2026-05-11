import { renderHook, waitFor, act } from "@testing-library/react-native";
import {
  useEquipmentList,
  useEquipmentDetail,
  useEquipmentByQrCode,
  useReportIssue,
} from "../useEquipment";

jest.mock("../../lib/api");
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
}));

const mockApi = require("../../lib/api").default;

const mockEquipment = {
  id: "eq-1",
  gymId: "g-1",
  name: "Treadmill Pro 3000",
  quantity: 4,
  status: "OPERATIONAL" as const,
  statusColor: "#22c55e",
  isServiceOverdue: false,
  isWarrantyExpired: false,
  openRequestsCount: 0,
  createdAt: "2024-01-01T00:00:00Z",
};

describe("useEquipmentList", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch equipment list on mount", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: { content: [mockEquipment], totalPages: 1, totalElements: 1 } },
    });

    const { result } = renderHook(() => useEquipmentList());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("Treadmill Pro 3000");
    expect(mockApi.get).toHaveBeenCalledWith(expect.stringContaining("/equipment"));
  });

  it("should pass status filter in query params", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: { content: [], totalPages: 0, totalElements: 0 } },
    });

    renderHook(() => useEquipmentList({ status: "MAINTENANCE" }));

    await waitFor(() => {});

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("status=MAINTENANCE")
    );
  });

  it("should pass search query in params", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: { content: [], totalPages: 0, totalElements: 0 } },
    });

    renderHook(() => useEquipmentList({ search: "treadmill" }));

    await waitFor(() => {});

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("search=treadmill")
    );
  });

  it("should return empty items on error (silent fail)", async () => {
    mockApi.get.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useEquipmentList());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toHaveLength(0);
  });
});

describe("useEquipmentDetail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should not fetch when id is null", async () => {
    const { result } = renderHook(() => useEquipmentDetail(null));

    await waitFor(() => {});

    expect(mockApi.get).not.toHaveBeenCalled();
    expect(result.current.equipment).toBeNull();
  });

  it("should fetch detail for given id", async () => {
    const detail = { ...mockEquipment, daysUntilService: 30 };
    mockApi.get.mockResolvedValueOnce({ data: { data: detail } });

    const { result } = renderHook(() => useEquipmentDetail("eq-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.equipment?.name).toBe("Treadmill Pro 3000");
    expect(mockApi.get).toHaveBeenCalledWith("/equipment/eq-1");
  });
});

describe("useEquipmentByQrCode", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should not fetch when qrCode is null", async () => {
    const { result } = renderHook(() => useEquipmentByQrCode(null));

    await waitFor(() => {});

    expect(mockApi.get).not.toHaveBeenCalled();
  });

  it("should fetch equipment by QR code", async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: mockEquipment } });

    const { result } = renderHook(() => useEquipmentByQrCode("QR-EQ-001"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.equipment?.name).toBe("Treadmill Pro 3000");
    expect(mockApi.get).toHaveBeenCalledWith("/equipment/qr/QR-EQ-001");
  });

  it("should set error when QR code not found", async () => {
    mockApi.get.mockRejectedValueOnce(new Error("Not found"));

    const { result } = renderHook(() => useEquipmentByQrCode("INVALID-QR"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Equipment not found.");
    expect(result.current.equipment).toBeNull();
  });
});

describe("useReportIssue", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should POST maintenance request and return request number", async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { data: { requestNumber: "MR-001" } },
    });

    const { result } = renderHook(() => useReportIssue());

    let response: { requestNumber: string } | null = null;
    await act(async () => {
      response = await result.current.report({
        equipmentId: "eq-1",
        title: "Broken belt",
        priority: "HIGH",
      });
    });

    expect(response?.requestNumber).toBe("MR-001");
    expect(mockApi.post).toHaveBeenCalledWith(
      "/equipment/maintenance",
      expect.objectContaining({ equipmentId: "eq-1", title: "Broken belt", priority: "HIGH" })
    );
  });

  it("should return null on failure", async () => {
    mockApi.post.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useReportIssue());

    let response: { requestNumber: string } | null = { requestNumber: "dummy" };
    await act(async () => {
      response = await result.current.report({ equipmentId: "eq-1", title: "Broken belt" });
    });

    expect(response).toBeNull();
  });
});
