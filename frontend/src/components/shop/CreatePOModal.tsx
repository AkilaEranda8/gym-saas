"use client";
import React, { useState } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { ProductDTO, POItemRequest, useCreatePurchaseOrder } from "@/hooks/useShop";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  products: ProductDTO[];
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePOModal({ open, products, onClose, onCreated }: Props) {
  const { create, loading } = useCreatePurchaseOrder();
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<POItemRequest[]>([
    { productId: "", quantityOrdered: 1, unitCostLkr: 0 },
  ]);

  if (!open) return null;

  const updateItem = (i: number, key: keyof POItemRequest, val: string | number) => {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  };

  const addItem = () => setItems((prev) => [...prev, { productId: "", quantityOrdered: 1, unitCostLkr: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const totalLkr = items.reduce((s, item) => s + item.quantityOrdered * item.unitCostLkr, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((item) => !item.productId)) { toast.error("Select a product for each item."); return; }
    const result = await create({
      supplierName: supplierName || undefined,
      supplierPhone: supplierPhone || undefined,
      notes: notes || undefined,
      items,
    });
    if (result) {
      toast.success(`PO #${result.poNumber} created!`);
      onCreated();
      onClose();
      setItems([{ productId: "", quantityOrdered: 1, unitCostLkr: 0 }]);
      setSupplierName(""); setSupplierPhone(""); setNotes("");
    } else {
      toast.error("Failed to create purchase order.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Create Purchase Order</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Supplier Name</label>
              <input value={supplierName} onChange={(e) => setSupplierName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Supplier / vendor name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Supplier Phone</label>
              <input value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+94 7X XXX XXXX" />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-600">Items *</label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={item.productId} onChange={(e) => updateItem(i, "productId", e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                    <option value="">Select product</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min={1} value={item.quantityOrdered}
                    onChange={(e) => updateItem(i, "quantityOrdered", parseInt(e.target.value || "1"))}
                    className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Qty" />
                  <input type="number" min={0} step={0.01}
                    value={item.unitCostLkr > 0 ? (item.unitCostLkr / 100).toFixed(2) : ""}
                    onChange={(e) => updateItem(i, "unitCostLkr", Math.round(parseFloat(e.target.value || "0") * 100))}
                    className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Unit cost" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-sm font-semibold text-slate-700">
              Total: Rs. {(totalLkr / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create PO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
