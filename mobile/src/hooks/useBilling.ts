import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";

export type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "CANCELLED";
export type PaymentType   = "MEMBERSHIP" | "PT_SESSION" | "SHOP_PURCHASE" | "LOCKER" | "CLASS_BOOKING" | "OTHER";
export type PaymentMethod = "CASH" | "CARD" | "ONLINE" | "BANK_TRANSFER" | "PAYHERE" | "EZ_CASH" | "M_CASH";

export interface PaymentDTO {
  id: string;
  paymentNumber: string;
  paymentType: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  finalAmountFormatted: string;
  amountLkr: number;
  discountLkr?: number;
  description?: string;
  paidAt?: string;
  dueDate?: string;
  createdAt: string;
  invoiceNumber?: string;
  isOverdue: boolean;
}

export interface PaymentDetailDTO extends PaymentDTO {
  items: { id: string; description: string; quantity: number; unitPriceLkr: number; totalLkr: number }[];
  referenceNo?: string;
  notes?: string;
  taxLkr?: number;
}

export interface BillingSummaryDTO {
  totalRevenueLkr: number;
  paidLkr: number;
  pendingLkr: number;
  refundedLkr: number;
  totalTransactions: number;
  paidCount: number;
  pendingCount: number;
}

export function useMyPayments(memberId: string | null) {
  const [payments, setPayments]   = useState<PaymentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!memberId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/billing/payments/member/${memberId}?size=50&sort=createdAt,desc`);
      setPayments(data.data?.content ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { payments, isLoading, error, refetch };
}

export function usePaymentDetail(id: string | null) {
  const [payment, setPayment]     = useState<PaymentDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.get(`/billing/payments/${id}`)
      .then((r: { data: { data: PaymentDetailDTO } }) => setPayment(r.data.data))
      .catch(() => setPayment(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { payment, isLoading };
}

export function useDownloadInvoice() {
  const [loading, setLoading] = useState(false);

  const getInvoiceUrl = async (paymentId: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { data } = await api.get(`/billing/invoices/by-payment/${paymentId}`);
      const inv = data.data;
      if (!inv?.id) return null;
      return `/api/v1/billing/invoices/${inv.id}/pdf`;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getInvoiceUrl, loading };
}
