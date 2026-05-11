"use client";
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { PurchaseOrderDTO, ReceiveItemRequest, useReceivePurchaseOrder } from "@/hooks/useShop";
import toast from "react-hot-toast";

interface Props {
  po: PurchaseOrderDTO | null;
  onClose: () => void;
  onReceived: () => void;
}

export default function ReceivePOModal({ po, onClose, onReceived }: Props) {
  const { receive, loading } = useReceivePurchaseOrder();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  if (!po) return null;

  const setQty = (itemId: string, qty: number) =>
    setQuantities((prev) => ({ ...prev, [itemId]: qty }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items: ReceiveItemRequest[] = po.items.map((item) => ({
      poItemId: item.id,
      quantityReceived: quantities[item.id] ?? item.quantityOrdered,
    }));
    const result = await receive(po.id, { items, notes: notes || undefined });
    if (result) {
      toast.success(`PO #${result.poNumber} received!`);
      onReceived();
      onClose();
    } else {
      toast.error("Failed to receive purchase order.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Receive PO #{po.poNumber}</h2>
            {po.supplierName && <p className="text-xs text-slate-400">{po.supplierName}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-500">Enter the quantity actually received for each item. Default is the ordered quantity.</p>

          <div className="space-y-3">
            {po.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{item.productName}</p>
                  <p className="text-xs text-slate-400">Ordered: {item.quantityOrdered} · Already received: {item.quantityReceived}</p>
                </div>
                <input type="number" min={0} max={item.quantityOrdered}
                  value={quantities[item.id] ?? (item.quantityOrdered - item.quantityReceived)}
                  onChange={(e) => setQty(item.id, parseInt(e.target.value || "0"))}
                  className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional delivery notes..." />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Mark as Received
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
