"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TopProductDTO } from "@/hooks/useShop";

interface Props { products: TopProductDTO[]; loading: boolean; }

export default function TopProductsChart({ products, loading }: Props) {
  const data = products.slice(0, 8).map((p) => ({
    name: p.productName.length > 15 ? p.productName.substring(0, 14) + "…" : p.productName,
    revenue: p.revenueLkr / 100,
    qty: p.qtySold,
  }));

  if (loading) return <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />;

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl">
        No product data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false}
          angle={-35} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(v: number, name: string) =>
            name === "revenue"
              ? [`Rs. ${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Revenue"]
              : [v, "Units Sold"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
