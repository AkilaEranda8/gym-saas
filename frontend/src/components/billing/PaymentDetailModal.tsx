"use client";
import { PaymentDetailDTO } from "@/hooks/useBilling";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentMethodBadge from "./PaymentMethodBadge";
import PaymentTypeTag from "./PaymentTypeTag";
import { X, FileText, Download } from "lucide-react";
import api from "@/lib/axios";

function fmt(lkr: number) {
  return "Rs. " + (lkr / 100).toLocaleString("en-LK", { minimumFractionDigits: 2 });
}

function fmtDt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-LK", { dateStyle: "medium", timeStyle: "short" });
}

interface Props {
  payment: PaymentDetailDTO;
  onClose: () => void;
}

export default function PaymentDetailModal({ payment, onClose }: Props) {
  const downloadInvoice = async () => {
    if (!payment.invoiceNumber) return;
    try {
      const res = await api.get(`/billing/invoices/by-payment/${payment.id}`);
      const inv = res.data.data;
      if (!inv?.id) return;
      window.open(`/api/v1/billing/invoices/${inv.id}/pdf`, "_blank");
    } catch { }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{payment.paymentNumber}</h2>
            <div className="flex items-center gap-2 mt-1">
              <PaymentStatusBadge status={payment.status} />
              <PaymentTypeTag type={payment.paymentType} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {payment.invoiceNumber && (
              <button onClick={downloadInvoice}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                <Download className="w-4 h-4" />
                Invoice
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Info label="Member" value={payment.memberName ?? "—"} />
            <Info label="Phone" value={payment.memberPhone ?? "—"} />
            <Info label="Method" value={<PaymentMethodBadge method={payment.method} />} />
            <Info label="Reference" value={payment.referenceNo ?? "—"} />
            <Info label="Paid At" value={fmtDt(payment.paidAt)} />
            <Info label="Created" value={fmtDt(payment.createdAt)} />
            {payment.description && <Info label="Description" value={payment.description} />}
            {payment.notes && <Info label="Notes" value={payment.notes} />}
          </div>

          {payment.items && payment.items.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Items</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Unit</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payment.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2 text-slate-700">{it.description}</td>
                      <td className="py-2 text-right text-slate-500">{it.quantity}</td>
                      <td className="py-2 text-right text-slate-500">{fmt(it.unitPriceLkr)}</td>
                      <td className="py-2 text-right font-medium text-slate-700">{fmt(it.totalLkr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <Row label="Subtotal"  value={fmt(payment.amountLkr)} />
            {!!payment.discountLkr && <Row label="Discount" value={`- ${fmt(payment.discountLkr)}`} accent="text-emerald-600" />}
            {!!payment.taxLkr     && <Row label="Tax"      value={fmt(payment.taxLkr)} />}
            <div className="border-t border-slate-200 pt-2 mt-2">
              <Row label="Total" value={payment.finalAmountFormatted} bold />
            </div>
          </div>

          {payment.status === "REFUNDED" && (
            <div className="bg-purple-50 rounded-xl p-4 text-sm text-purple-700">
              <strong>Refund reason:</strong> {payment.refundReason ?? "—"}<br />
              <strong>Refunded at:</strong> {fmtDt(payment.refundedAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-slate-700">{value}</div>
    </div>
  );
}

function Row({ label, value, accent, bold }: { label: string; value: string; accent?: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm ${bold ? "font-bold text-slate-800" : accent ?? "text-slate-700"}`}>{value}</span>
    </div>
  );
}
