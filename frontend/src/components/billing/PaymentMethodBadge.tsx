"use client";
import { PaymentMethod, PAYMENT_METHOD_ICONS } from "@/hooks/useBilling";

const LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash", CARD: "Card", ONLINE: "Online", BANK_TRANSFER: "Bank Transfer",
  PAYHERE: "PayHere", EZ_CASH: "EZ Cash", M_CASH: "mCash",
};

export default function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
      <span>{PAYMENT_METHOD_ICONS[method]}</span>
      <span>{LABELS[method]}</span>
    </span>
  );
}
