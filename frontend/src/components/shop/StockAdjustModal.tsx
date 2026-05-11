"use client";
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { ProductDTO, StockMovementType, useAdjustStock } from "@/hooks/useShop";
import toast from "react-hot-toast";

interface Props {
  product: ProductDTO | null;
  onClose: () => void;
  onDone: () => void;
}

const MOVEMENT_TYPES: { value: StockMovementType; label: string }[] = [
  { value: "PURCHASE", label: "Purchase / Restock" },
  { value: "ADJUSTMENT", label: "Manual Adjustment" },
  { value: "RETURN", label: "Return / Returned by Customer" },
  { value: "WRITE_OFF", label: "Write-Off / Damage" },
  { value: "TRANSFER", label: "Transfer" },
];

export default function StockAdjustModal({ product, onClose, onDone }: Props) {
  const { adjust, loading } = useAdjustStock();
  const [qty, setQty] = useState(0);
  const [type, setType] = useState<StockMovementType>("ADJUSTMENT");
  const [notes, setNotes] = useState("");

  if (!product) return null;

  const isDeduction = ["WRITE_OFF", "SALE"].includes(type);
  const projected = isDeduction
    ? (product.stockQty - Math.abs(qty))
    : (product.stockQty + Math.abs(qty));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qty === 0) { toast.error("Quantity cannot be zero."); return; }
    const result = await adjust(product.id, { quantity: qty, movementType: type, notes: notes || undefined });
    if (result) {
      toast.success(`Stock updated. New qty: ${result.stockQty}`);
      onDone();
      onClose();
    } else {
      toast.error("Stock adjustment failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Adjust Stock</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-sm font-semibold text-slate-800">{product.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">Current stock: <span className="font-bold">{product.stockQty}</span> {product.unit}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Movement Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as StockMovementType)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MOVEMENT_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
            <input type="number" min={1}
              value={qty === 0 ? "" : qty}
              onChange={(e) => setQty(parseInt(e.target.value || "0"))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity" required />
            {qty !== 0 && (
              <p className={`text-xs mt-1 ${projected < 0 ? "text-red-500" : "text-slate-500"}`}>
                Projected stock: <span className="font-semibold">{projected}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional note..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || projected < 0}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
