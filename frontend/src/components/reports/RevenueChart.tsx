"use client";
import React from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import type { MonthlyRevenueDTO, RevenueByTypeDTO } from "@/hooks/useReports";

const GOLD = "#f59e0b";
const GREEN = "#10b981";
const RED   = "#ef4444";
const BLUE  = "#3b82f6";
const PIE_COLORS = [GOLD, BLUE, GREEN, "#8b5cf6", RED, "#ec4899", "#14b8a6"];

function fmtLkr(v: number) {
  if (v >= 1_000_000) return `Rs.${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `Rs.${(v / 1_000).toFixed(0)}K`;
  return `Rs.${v}`;
}

// ── Revenue Area Chart ────────────────────────────────────────────────────────
interface RevenueAreaProps {
  data: MonthlyRevenueDTO[];
}
export function RevenueAreaChart({ data }: RevenueAreaProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={GOLD} stopOpacity={0.25} />
            <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => fmtLkr(v as number)} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }}
          labelStyle={{ color: "#e2e8f0", fontSize: 12 }}
          formatter={(v: unknown) => [fmtLkr(v as number), "Revenue"]}
        />
        <Area type="monotone" dataKey="revenueLkr" stroke={GOLD} strokeWidth={2} fill="url(#revGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Revenue Growth Bar Chart ──────────────────────────────────────────────────
export function RevenueGrowthChart({ data }: RevenueAreaProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => `${v}%`} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }}
          labelStyle={{ color: "#e2e8f0", fontSize: 12 }}
          formatter={(v: unknown) => [`${(v as number).toFixed(1)}%`, "Growth"]}
        />
        <Bar dataKey="growthPct" fill={GOLD} radius={[4, 4, 0, 0]}
          label={{ position: "top", formatter: (v: number) => `${v.toFixed(0)}%`, fill: "#6b7280", fontSize: 10 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Revenue by Type Pie ───────────────────────────────────────────────────────
interface RevByTypeProps { data: RevenueByTypeDTO[] }
export function RevenueByTypePie({ data }: RevByTypeProps) {
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
            dataKey="totalLkr" paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }}
            formatter={(v: unknown) => [fmtLkr(v as number), "Revenue"]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={d.paymentType} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-gray-400">{d.label}</span>
            <span className="ml-auto text-white font-medium">{d.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
