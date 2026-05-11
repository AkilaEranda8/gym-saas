"use client";
import { PaymentStatus, PAYMENT_STATUS_COLORS } from "@/hooks/useBilling";

const LABELS: Record<PaymentStatus, string> = {
  PAID: "Paid", PENDING: "Pending", FAILED: "Failed",
  REFUNDED: "Refunded", CANCELLED: "Cancelled",
};

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[status]}`}>
      {LABELS[status]}
    </span>
  );
}
