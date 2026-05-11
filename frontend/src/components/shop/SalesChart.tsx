"use client";
import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DailySalesDTO } from "@/hooks/useShop";

interface Props { sales: DailySalesDTO[]; loading: boolean; }

export default function SalesChart({ sales, loading }: Props) {
  const data = sales.map((s) => ({
    date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: s.revenueLkr / 100,
    orders: s.orderCount,
    items: s.itemsSold,
  }));

  if (loading) {
    return <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl">
        No sales data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="shopRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false}
          tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: number) => [`Rs. ${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Revenue"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2}
          fill="url(#shopRev)" dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
