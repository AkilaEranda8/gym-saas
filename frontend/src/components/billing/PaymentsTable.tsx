"use client";
import { PaymentDTO } from "@/hooks/useBilling";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentMethodBadge from "./PaymentMethodBadge";
import PaymentTypeTag from "./PaymentTypeTag";
import { Eye, FileText, AlertTriangle } from "lucide-react";

interface Props {
  payments: PaymentDTO[];
  onView: (p: PaymentDTO) => void;
  onInvoice?: (p: PaymentDTO) => void;
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-LK", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PaymentsTable({ payments, onView, onInvoice }: Props) {
  if (!payments.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No payments found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
            <th className="py-3 px-4">Payment #</th>
            <th className="py-3 px-4">Member</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Method</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {payments.map((p) => (
            <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${p.isOverdue ? "bg-red-50/50" : ""}`}>
              <td className="py-3 px-4 font-mono text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  {p.isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                  {p.paymentNumber}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-slate-800">{p.memberName ?? "—"}</div>
                {p.memberPhone && <div className="text-xs text-slate-400">{p.memberPhone}</div>}
              </td>
              <td className="py-3 px-4"><PaymentTypeTag type={p.paymentType} /></td>
              <td className="py-3 px-4">
                <div className="font-semibold text-slate-800">{p.finalAmountFormatted}</div>
                {p.discountLkr != null && p.discountLkr > 0 && (
                  <div className="text-xs text-emerald-600">-Rs. {(p.discountLkr / 100).toFixed(2)} disc.</div>
                )}
              </td>
              <td className="py-3 px-4"><PaymentMethodBadge method={p.method} /></td>
              <td className="py-3 px-4"><PaymentStatusBadge status={p.status} /></td>
              <td className="py-3 px-4 text-slate-500">{fmtDate(p.paidAt ?? p.createdAt)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={() => onView(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View details">
                    <Eye className="w-4 h-4" />
                  </button>
                  {p.invoiceNumber && onInvoice && (
                    <button onClick={() => onInvoice(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Download invoice">
                      <FileText className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
