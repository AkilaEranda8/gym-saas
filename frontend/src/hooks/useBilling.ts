"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────

export type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "CANCELLED";
export type PaymentType   = "MEMBERSHIP" | "PT_SESSION" | "SHOP_PURCHASE" | "LOCKER" | "CLASS_BOOKING" | "OTHER";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "BANK_TRANSFER" | "PAYHERE" | "EZ_CASH" | "M_CASH";
export type DiscountType  = "PERCENTAGE" | "FIXED";

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PAID:      "bg-emerald-100 text-emerald-700",
  PENDING:   "bg-amber-100 text-amber-700",
  FAILED:    "bg-red-100 text-red-700",
  REFUNDED:  "bg-purple-100 text-purple-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  CASH: "💵", CARD: "💳", ONLINE: "🌐", BANK_TRANSFER: "🏦",
  PAYHERE: "🔵", EZ_CASH: "📱", M_CASH: "📲",
};

export interface PaymentItemDTO {
  id: string; description: string; quantity: number;
  unitPriceLkr: number; totalLkr: number;
}

export interface PaymentDTO {
  id: string; gymId: string; branchId?: string; memberId: string;
  memberName?: string; memberPhone?: string; paymentNumber: string;
  paymentType: PaymentType; amountLkr: number; discountLkr?: number;
  finalAmountLkr: number; finalAmountFormatted: string;
  method: PaymentMethod; status: PaymentStatus;
  referenceNo?: string; description?: string;
  paidAt?: string; dueDate?: string; createdAt: string;
  invoiceNumber?: string; invoiceUrl?: string; isOverdue: boolean;
}

export interface PaymentDetailDTO extends PaymentDTO {
  taxLkr?: number; payhereOrderId?: string; notes?: string;
  refundReason?: string; refundedAt?: string; createdBy?: string;
  items: PaymentItemDTO[];
}

export interface BillingSummaryDTO {
  totalRevenueLkr: number; paidLkr: number; pendingLkr: number;
  failedLkr: number; refundedLkr: number; totalTransactions: number;
  paidCount: number; pendingCount: number; failedCount: number;
  refundedCount: number; totalExpensesLkr: number; netProfitLkr: number;
  periodFrom: string; periodTo: string;
}

export interface MonthlyRevenueDTO {
  month: string; revenueLkr: number; expensesLkr: number;
  netProfitLkr: number; transactionCount: number;
}

export interface RevenueByTypeDTO {
  paymentType: PaymentType; totalLkr: number; count: number; percentage: number;
}

export interface DiscountDTO {
  id: string; gymId: string; code: string; description?: string;
  discountType: DiscountType; discountValue: number; maxUses?: number;
  usedCount: number; remainingUses?: number; validFrom: string;
  validUntil?: string; isActive: boolean; isExpired: boolean;
}

export interface DiscountValidationDTO {
  valid: boolean; code?: string; discountType?: DiscountType;
  discountValue?: number; discountLkr?: number; finalAmountLkr?: number; message: string;
}

export interface ExpenseCategoryDTO {
  id: string; gymId: string; name: string; color?: string;
}

export interface ExpenseDTO {
  id: string; gymId: string; branchId?: string; categoryId?: string;
  categoryName?: string; categoryColor?: string; description: string;
  amountLkr: number; expenseDate: string; receiptUrl?: string;
  paidBy?: string; notes?: string;
}

export interface ExpenseSummaryDTO {
  totalLkr: number;
  byCategory: { categoryId: string; categoryName: string; categoryColor?: string; totalLkr: number; percentage: number }[];
  byMonth: { month: string; totalLkr: number }[];
}

export interface InvoiceDTO {
  id: string; invoiceNumber: string; paymentId: string; memberId: string;
  memberName?: string; gymName?: string; items: PaymentItemDTO[];
  subtotalLkr: number; discountLkr?: number; taxLkr?: number; totalLkr: number;
  footerText?: string; notes?: string; issuedAt: string; dueDate?: string; pdfUrl?: string;
}

export interface RecordPaymentRequest {
  memberId: string; paymentType: PaymentType; amountLkr: number;
  discountCode?: string; method: PaymentMethod; referenceNo?: string;
  description?: string; notes?: string; dueDate?: string;
  items?: { description: string; quantity: number; unitPriceLkr: number }[];
  generateInvoice: boolean;
}

export interface PageResponse<T> {
  content: T[]; totalElements: number; totalPages: number;
  number: number; size: number;
}

// ── Payments ──────────────────────────────────────────────────

export function usePayments(params?: {
  memberId?: string; status?: string; type?: string;
  method?: string; page?: number; size?: number;
}) {
  const [payments, setPayments]   = useState<PageResponse<PaymentDTO> | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (params?.memberId) q.set("memberId", params.memberId);
      if (params?.status)   q.set("status",   params.status);
      if (params?.type)     q.set("type",     params.type);
      if (params?.method)   q.set("method",   params.method);
      if (params?.page !== undefined) q.set("page", String(params.page));
      if (params?.size !== undefined) q.set("size", String(params.size));
      const { data } = await api.get(`/billing/payments?${q.toString()}`);
      setPayments(data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [params?.memberId, params?.status, params?.type, params?.method, params?.page, params?.size]);

  useEffect(() => { load(); }, [load]);
  return { payments, loading, error, refetch: load };
}

export function usePaymentDetail(id: string | null) {
  const [payment, setPayment] = useState<PaymentDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/billing/payments/${id}`)
      .then(r => setPayment(r.data.data))
      .catch(() => setPayment(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { payment, loading };
}

export function useRecordPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const record = async (req: RecordPaymentRequest): Promise<PaymentDetailDTO | null> => {
    try {
      setLoading(true); setError(null);
      const { data } = await api.post("/billing/payments", req);
      return data.data;
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to record payment");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { record, loading, error };
}

export function useRefundPayment() {
  const [loading, setLoading] = useState(false);
  const refund = async (id: string, reason: string) => {
    setLoading(true);
    try {
      await api.post(`/billing/payments/${id}/refund`, { reason });
      return true;
    } finally { setLoading(false); }
  };
  return { refund, loading };
}

// ── Billing Summary ────────────────────────────────────────────

export function useBillingSummary(from: string, to: string) {
  const [summary, setSummary] = useState<BillingSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    api.get(`/billing/payments/summary?from=${from}&to=${to}`)
      .then(r => setSummary(r.data.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [from, to]);

  return { summary, loading };
}

export function useMonthlyRevenue(months = 12) {
  const [data, setData]       = useState<MonthlyRevenueDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/billing/payments/monthly-revenue?months=${months}`)
      .then(r => setData(r.data.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [months]);

  return { data, loading };
}

export function useRevenueByType(from: string, to: string) {
  const [data, setData]       = useState<RevenueByTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!from || !to) return;
    api.get(`/billing/payments/revenue-by-type?from=${from}&to=${to}`)
      .then(r => setData(r.data.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [from, to]);

  return { data, loading };
}

// ── Discounts ──────────────────────────────────────────────────

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<DiscountDTO[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/billing/discounts");
      setDiscounts(data.data?.content ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (req: {
    code: string; description?: string; discountType: DiscountType;
    discountValue: number; maxUses?: number; validFrom: string; validUntil?: string;
  }) => {
    await api.post("/billing/discounts", req);
    load();
  };

  const toggle = async (id: string) => {
    await api.patch(`/billing/discounts/${id}/toggle`);
    load();
  };

  const remove = async (id: string) => {
    await api.delete(`/billing/discounts/${id}`);
    load();
  };

  const validate = async (code: string, amountLkr: number): Promise<DiscountValidationDTO> => {
    const { data } = await api.post("/billing/discounts/validate", { code, amountLkr });
    return data.data;
  };

  return { discounts, loading, create, toggle, remove, validate, refetch: load };
}

// ── Expenses ───────────────────────────────────────────────────

export function useExpenses(params?: {
  categoryId?: string; from?: string; to?: string; page?: number;
}) {
  const [expenses, setExpenses] = useState<PageResponse<ExpenseDTO> | null>(null);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (params?.categoryId) q.set("categoryId", params.categoryId);
      if (params?.from) q.set("from", params.from);
      if (params?.to)   q.set("to", params.to);
      if (params?.page !== undefined) q.set("page", String(params.page));
      const { data } = await api.get(`/billing/expenses?${q.toString()}`);
      setExpenses(data.data);
    } finally { setLoading(false); }
  }, [params?.categoryId, params?.from, params?.to, params?.page]);

  useEffect(() => { load(); }, [load]);

  const create = async (req: {
    description: string; amountLkr: number; expenseDate: string;
    categoryId?: string; branchId?: string; receiptUrl?: string; paidBy?: string; notes?: string;
  }) => {
    await api.post("/billing/expenses", req);
    load();
  };

  const remove = async (id: string) => {
    await api.delete(`/billing/expenses/${id}`);
    load();
  };

  return { expenses, loading, create, remove, refetch: load };
}

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategoryDTO[]>([]);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/billing/expenses/categories");
      setCategories(data.data ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (name: string, color?: string) => {
    await api.post("/billing/expenses/categories", { name, color });
    load();
  };

  return { categories, loading, create, refetch: load };
}

export function useExpenseSummary(from: string, to: string) {
  const [summary, setSummary] = useState<ExpenseSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!from || !to) return;
    api.get(`/billing/expenses/summary?from=${from}&to=${to}`)
      .then(r => setSummary(r.data.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [from, to]);

  return { summary, loading };
}

// ── Invoices ───────────────────────────────────────────────────

export function useInvoice(paymentId: string | null) {
  const [invoice, setInvoice] = useState<InvoiceDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paymentId) return;
    setLoading(true);
    api.get(`/billing/invoices/by-payment/${paymentId}`)
      .then(r => setInvoice(r.data.data))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [paymentId]);

  return { invoice, loading };
}
