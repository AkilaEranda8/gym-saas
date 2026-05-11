"use client";
import { PaymentType } from "@/hooks/useBilling";

const COLORS: Record<PaymentType, string> = {
  MEMBERSHIP:    "bg-blue-100 text-blue-700",
  PT_SESSION:    "bg-violet-100 text-violet-700",
  SHOP_PURCHASE: "bg-orange-100 text-orange-700",
  LOCKER:        "bg-cyan-100 text-cyan-700",
  CLASS_BOOKING: "bg-pink-100 text-pink-700",
  OTHER:         "bg-slate-100 text-slate-600",
};

const LABELS: Record<PaymentType, string> = {
  MEMBERSHIP: "Membership", PT_SESSION: "PT Session", SHOP_PURCHASE: "Shop",
  LOCKER: "Locker", CLASS_BOOKING: "Class", OTHER: "Other",
};

export default function PaymentTypeTag({ type }: { type: PaymentType }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${COLORS[type]}`}>
      {LABELS[type]}
    </span>
  );
}
