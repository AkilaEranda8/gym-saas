"use client";
import React, { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { ShopOrderDTO, useRefundOrder } from "@/hooks/useShop";
import toast from "react-hot-toast";

interface Props {
  order: ShopOrderDTO | null;
  onClose: () => void;
  onRefunded: () => void;
}

export default function RefundModal({ order, onClose, onRefunded }: Props) {
  const { refund, loading } = useRefundOrder();
  const [reason, setReason] = useState("");

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { toast.error("Please enter a refund reason."); return; }
    const result = await refund(order.id, reason);
    if (result) {
      toast.success(`Order #${order.orderNumber} refunded.`);
      onRefunded();
      onClose();
    } else {
      toast.error("Refund failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Refund Order</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800">Confirm refund for Order #{order.orderNumber}</p>
              <p className="text-amber-700 mt-0.5">Amount: {order.totalFormatted}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reason *</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter refund reason..." required />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Issue Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
