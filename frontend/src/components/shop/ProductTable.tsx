"use client";
import React from "react";
import { Edit2, Trash2, BarChart2, Package } from "lucide-react";
import { ProductDTO, fmtLkr } from "@/hooks/useShop";
import StockBadge from "./StockBadge";

interface Props {
  products: ProductDTO[];
  loading: boolean;
  onEdit: (p: ProductDTO) => void;
  onDelete: (p: ProductDTO) => void;
  onAdjustStock: (p: ProductDTO) => void;
}

export default function ProductTable({ products, loading, onEdit, onDelete, onAdjustStock }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Package className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-sm">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3">Product</th>
            <th className="text-left px-4 py-3">Category</th>
            <th className="text-left px-4 py-3">SKU</th>
            <th className="text-right px-4 py-3">Price</th>
            <th className="text-center px-4 py-3">Stock</th>
            <th className="text-center px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-800">{p.name}</p>
                    {p.brand && <p className="text-xs text-slate-400">{p.brand}</p>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{p.categoryName ?? "—"}</td>
              <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku ?? "—"}</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800">{p.priceFormatted}</td>
              <td className="px-4 py-3 text-center">
                <StockBadge stockQty={p.stockQty} minStockQty={p.minStockQty}
                  isLowStock={p.isLowStock} isOutOfStock={p.isOutOfStock} />
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onAdjustStock(p)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Adjust Stock">
                    <BarChart2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(p)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(p)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
