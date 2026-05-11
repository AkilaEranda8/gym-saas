"use client";
import React from "react";
import { AlertTriangle } from "lucide-react";
import { LowStockAlertDTO } from "@/hooks/useShop";

interface Props { alerts: LowStockAlertDTO[]; loading: boolean; }

export default function LowStockTable({ alerts, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-xl text-emerald-700 text-sm">
        <span>✅</span> All products are sufficiently stocked.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border-b border-amber-100">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-semibold text-amber-700">{alerts.length} product(s) need restocking</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="text-left px-4 py-2">Product</th>
            <th className="text-left px-4 py-2">Category</th>
            <th className="text-left px-4 py-2">SKU</th>
            <th className="text-center px-4 py-2">Current</th>
            <th className="text-center px-4 py-2">Min</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alerts.map((a) => (
            <tr key={a.productId} className="hover:bg-amber-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{a.productName}</td>
              <td className="px-4 py-3 text-slate-500">{a.categoryName ?? "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-400">{a.sku ?? "—"}</td>
              <td className="px-4 py-3 text-center">
                <span className="font-bold text-red-600">{a.currentStock}</span>
              </td>
              <td className="px-4 py-3 text-center text-slate-500">{a.minStockQty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
