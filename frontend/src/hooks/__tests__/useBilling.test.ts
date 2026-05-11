import { renderHook, waitFor } from "@testing-library/react";
import api from "@/lib/axios";

jest.mock("@/lib/axios");
jest.mock("@/lib/auth", () => ({ getAccessToken: jest.fn().mockResolvedValue("token") }));

const mockApi = api as jest.Mocked<typeof api>;

const mockSummary = {
  totalRevenueLkr: 500000,
  paidLkr: 500000,
  pendingLkr: 0,
  failedLkr: 0,
  refundedLkr: 0,
  totalTransactions: 10,
  paidCount: 10,
  pendingCount: 0,
  failedCount: 0,
  refundedCount: 0,
  totalExpensesLkr: 50000,
  netProfitLkr: 450000,
  periodFrom: "2025-04-01",
  periodTo: "2025-04-30",
};

const mockPaymentPage = {
  content: [{
    id: "pay-1",
    memberId: "mem-1",
    memberName: "Kamal Perera",
    paymentNumber: "PAY250500001",
    paymentType: "MEMBERSHIP",
    amountLkr: 350000,
    finalAmountLkr: 350000,
    method: "CASH",
    status: "PAID",
  }],
  totalElements: 1,
  totalPages: 1,
  number: 0,
};

const mockDiscount = {
  id: "disc-1",
  gymId: "gym-1",
  code: "SAVE10",
  discountType: "PERCENTAGE",
  discountValue: 10,
  isActive: true,
  isExpired: false,
};

describe("useBillingSummary", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch billing summary", async () => {
    const { useBillingSummary } = await import("@/hooks/useBilling");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockSummary } });

    const { result } = renderHook(() => useBillingSummary("2025-04-01", "2025-04-30"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toEqual(mockSummary);
    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/billing/payments/summary")
    );
  });

  it("should handle error gracefully", async () => {
    const { useBillingSummary } = await import("@/hooks/useBilling");
    mockApi.get.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useBillingSummary("2025-04-01", "2025-04-30"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load billing summary");
  });
});

describe("usePayments", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch payments page", async () => {
    const { usePayments } = await import("@/hooks/useBilling");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPaymentPage } });

    const { result } = renderHook(() => usePayments());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.content).toHaveLength(1);
    expect(result.current.data?.content[0].paymentNumber).toBe("PAY250500001");
  });

  it("should pass status filter to API", async () => {
    const { usePayments } = await import("@/hooks/useBilling");
    mockApi.get.mockResolvedValueOnce({ data: { data: mockPaymentPage } });

    renderHook(() => usePayments({ status: "PAID" }));

    await waitFor(() => {});

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("status=PAID")
    );
  });
});

describe("useDiscounts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should fetch active discounts", async () => {
    const { useDiscounts } = await import("@/hooks/useBilling");
    mockApi.get.mockResolvedValueOnce({ data: { data: [mockDiscount] } });

    const { result } = renderHook(() => useDiscounts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.discounts).toHaveLength(1);
    expect(result.current.discounts[0].code).toBe("SAVE10");
  });
});

describe("useRecordPayment", () => {
  it("should POST to payments endpoint and return data", async () => {
    const { useRecordPayment } = await import("@/hooks/useBilling");
    const newPayment = { id: "pay-2", status: "PAID", finalAmountLkr: 350000 };
    mockApi.post.mockResolvedValueOnce({ data: { data: newPayment } });

    const { result } = renderHook(() => useRecordPayment());
    const response = await result.current.record({ memberId: "mem-1", amountLkr: 350000, method: "CASH" });

    expect(response).toEqual(newPayment);
    expect(mockApi.post).toHaveBeenCalledWith(
      "/api/v1/billing/payments",
      expect.objectContaining({ memberId: "mem-1" })
    );
  });
});

describe("useRefundPayment", () => {
  it("should POST to refund endpoint", async () => {
    const { useRefundPayment } = await import("@/hooks/useBilling");
    mockApi.post.mockResolvedValueOnce({ data: { data: { id: "pay-1", status: "REFUNDED" } } });

    const { result } = renderHook(() => useRefundPayment());
    const response = await result.current.refund("pay-1", "Customer request");

    expect(response.status).toBe("REFUNDED");
    expect(mockApi.post).toHaveBeenCalledWith(
      "/api/v1/billing/payments/pay-1/refund",
      { reason: "Customer request" }
    );
  });
});
