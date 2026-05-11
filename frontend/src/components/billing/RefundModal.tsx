"use client";
import { useState } from "react";
import { PaymentDTO, useRefundPayment } from "@/hooks/useBilling";
import { X, AlertTriangle } from "lucide-react";

interface Props {
  payment: PaymentDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RefundModal({ payment, onClose, onSuccess }: Props) {
  const { refund, loading } = useRefundPayment();
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await refund(payment.id, reason);
    if (ok) { onSuccess(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-bold">Refund Payment</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-red-50 rounded-xl p-4 text-sm text-slate-700">
            <div className="font-medium mb-1">{payment.paymentNumber}</div>
            <div className="text-slate-500">{payment.finalAmountFormatted} — {payment.memberName}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Refund Reason *</label>
            <textarea required rows={3} value={reason} onChange={e => setReason(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              placeholder="Explain why this payment is being refunded…" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {loading ? "Processing…" : "Issue Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
