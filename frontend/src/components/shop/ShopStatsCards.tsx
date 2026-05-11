"use client";
import React from "react";
import { ShoppingCart, DollarSign, Package, AlertTriangle } from "lucide-react";
import { ShopSummaryDTO } from "@/hooks/useShop";

interface Props { summary: ShopSummaryDTO | null; loading: boolean; }

export default function ShopStatsCards({ summary, loading }: Props) {
  const cards = [
    {
      label: "Total Revenue",
      value: summary?.totalRevenueFormatted ?? "—",
      sub: `${summary?.totalOrders ?? 0} orders`,
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      label: "Avg Order Value",
      value: summary?.averageOrderFormatted ?? "—",
      sub: `${summary?.totalProductsSold ?? 0} items sold`,
      icon: <ShoppingCart className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Low Stock",
      value: String(summary?.lowStockCount ?? 0),
      sub: `${summary?.outOfStockCount ?? 0} out of stock`,
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      label: "Pending POs",
      value: String(summary?.pendingPOCount ?? 0),
      sub: "purchase orders",
      icon: <Package className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">{c.label}</span>
            <div className={`p-2 rounded-lg ${c.bg}`}>{c.icon}</div>
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-slate-100 animate-pulse rounded" />
          ) : (
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
