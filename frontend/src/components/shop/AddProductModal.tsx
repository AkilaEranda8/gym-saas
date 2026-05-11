"use client";
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { ProductCategoryDTO, ProductUnit, useCreateProduct, CreateProductRequest } from "@/hooks/useShop";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  categories: ProductCategoryDTO[];
  onClose: () => void;
  onCreated: () => void;
}

const UNITS: ProductUnit[] = ["UNIT", "KG", "GRAM", "LITRE", "ML", "PIECE", "BOX", "BOTTLE", "SACHET", "PAIR"];

export default function AddProductModal({ open, categories, onClose, onCreated }: Props) {
  const { create, loading } = useCreateProduct();
  const [form, setForm] = useState<Partial<CreateProductRequest>>({
    unit: "UNIT", isActive: true, isFeatured: false, stockQty: 0, minStockQty: 5,
  });

  if (!open) return null;

  const set = (k: keyof CreateProductRequest, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || !form.priceLkr) {
      toast.error("Name, category, and price are required.");
      return;
    }
    const result = await create(form as CreateProductRequest);
    if (result) {
      toast.success("Product created!");
      onCreated();
      onClose();
      setForm({ unit: "UNIT", isActive: true, isFeatured: false, stockQty: 0, minStockQty: 5 });
    } else {
      toast.error("Failed to create product.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Add Product</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Product name" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select value={form.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
              <select value={form.unit ?? "UNIT"} onChange={(e) => set("unit", e.target.value as ProductUnit)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Price (Rs.) *</label>
              <input type="number" min="0" step="0.01"
                value={form.priceLkr != null ? (form.priceLkr / 100).toFixed(2) : ""}
                onChange={(e) => set("priceLkr", Math.round(parseFloat(e.target.value || "0") * 100))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00" required />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cost Price (Rs.)</label>
              <input type="number" min="0" step="0.01"
                value={form.costPriceLkr != null ? (form.costPriceLkr / 100).toFixed(2) : ""}
                onChange={(e) => set("costPriceLkr", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Initial Stock</label>
              <input type="number" min="0"
                value={form.stockQty ?? 0}
                onChange={(e) => set("stockQty", parseInt(e.target.value || "0"))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Min Stock Alert</label>
              <input type="number" min="0"
                value={form.minStockQty ?? 5}
                onChange={(e) => set("minStockQty", parseInt(e.target.value || "0"))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Brand</label>
              <input value={form.brand ?? ""} onChange={(e) => set("brand", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brand name" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">SKU</label>
              <input value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Stock keeping unit" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Barcode</label>
              <input value={form.barcode ?? ""} onChange={(e) => set("barcode", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Barcode" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Product description" />
            </div>

            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive ?? true}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="rounded" />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isFeatured ?? false}
                  onChange={(e) => set("isFeatured", e.target.checked)}
                  className="rounded" />
                Featured
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
