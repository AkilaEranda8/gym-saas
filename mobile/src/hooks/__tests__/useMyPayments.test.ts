import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useMyPayments, usePaymentDetail, useDownloadInvoice } from "../useBilling";

jest.mock("../../lib/api");
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockApi = require("../../lib/api").default;

const mockPayment = {
  id: "p-1",
  paymentNumber: "PAY250400001",
  paymentType: "MEMBERSHIP",
  method: "CASH",
  status: "PAID",
  finalAmountFormatted: "Rs. 3,500.00",
  amountLkr: 350000,
  createdAt: "2025-04-01T00:00:00Z",
  isOverdue: false,
};

describe("useMyPayments", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should not fetch when memberId is null", async () => {
    const { result } = renderHook(() => useMyPayments(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockApi.get).not.toHaveBeenCalled();
    expect(result.current.payments).toHaveLength(0);
  });

  it("should fetch payments for a given memberId", async () => {
    mockApi.get.mockResolvedValueOnce({
      data: { data: { content: [mockPayment] } },
    });

    const { result } = renderHook(() => useMyPayments("member-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.payments).toHaveLength(1);
    expect(result.current.payments[0].paymentNumber).toBe("PAY250400001");
    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/billing/payments/member/member-1")
    );
  });

  it("should set error on fetch failure", async () => {
    mockApi.get.mockRejectedValueOnce({
      response: { data: { message: "Unauthorized" } },
    });

    const { result } = renderHook(() => useMyPayments("member-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Unauthorized");
    expect(result.current.payments).toHaveLength(0);
  });

  it("should refetch when refetch is called", async () => {
    mockApi.get.mockResolvedValue({
      data: { data: { content: [mockPayment] } },
    });

    const { result } = renderHook(() => useMyPayments("member-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockApi.get).toHaveBeenCalledTimes(1);

    act(() => { result.current.refetch(); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockApi.get).toHaveBeenCalledTimes(2);
  });
});

describe("usePaymentDetail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should not fetch when id is null", async () => {
    const { result } = renderHook(() => usePaymentDetail(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockApi.get).not.toHaveBeenCalled();
    expect(result.current.payment).toBeNull();
  });

  it("should fetch payment detail by id", async () => {
    const detail = { ...mockPayment, items: [], referenceNo: "REF123" };
    mockApi.get.mockResolvedValueOnce({ data: { data: detail } });

    const { result } = renderHook(() => usePaymentDetail("p-1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.payment?.paymentNumber).toBe("PAY250400001");
    expect(mockApi.get).toHaveBeenCalledWith("/billing/payments/p-1");
  });
});

describe("useDownloadInvoice", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return invoice PDF url when invoice exists", async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: { id: "inv-1" } } });

    const { result } = renderHook(() => useDownloadInvoice());
    const url = await result.current.getInvoiceUrl("p-1");

    expect(url).toBe("/api/v1/billing/invoices/inv-1/pdf");
    expect(mockApi.get).toHaveBeenCalledWith("/billing/invoices/by-payment/p-1");
  });

  it("should return null when invoice not found", async () => {
    mockApi.get.mockResolvedValueOnce({ data: { data: null } });

    const { result } = renderHook(() => useDownloadInvoice());
    const url = await result.current.getInvoiceUrl("p-1");

    expect(url).toBeNull();
  });

  it("should return null on API error", async () => {
    mockApi.get.mockRejectedValueOnce(new Error("Not found"));

    const { result } = renderHook(() => useDownloadInvoice());
    const url = await result.current.getInvoiceUrl("p-1");

    expect(url).toBeNull();
  });
});
