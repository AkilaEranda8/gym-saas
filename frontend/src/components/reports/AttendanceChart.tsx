"use client";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { DailyAttendanceDTO } from "@/hooks/useReports";

const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return "12am";
  if (i < 12)  return `${i}am`;
  if (i === 12) return "12pm";
  return `${i - 12}pm`;
});

// ── Daily Bar Chart ───────────────────────────────────────────────────────────
interface DailyProps { data: DailyAttendanceDTO[] }
export function DailyAttendanceChart({ data }: DailyProps) {
  const sliced = data.slice(-30);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sliced} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 10 }}
          axisLine={false} tickLine={false}
          tickFormatter={d => {
            const dt = new Date(d);
            return `${dt.getDate()}/${dt.getMonth() + 1}`;
          }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }}
          labelStyle={{ color: "#e2e8f0", fontSize: 12 }}
          formatter={(v: unknown) => [v as number, "Check-ins"] as [number, string]}
          labelFormatter={d => new Date(d).toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short" })}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {sliced.map((d, i) => (
            <Cell key={i} fill={d.isSriLankanHoliday ? "#ef4444" : d.isWeekend ? "#f59e0b" : "#3b82f6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Hourly Heatmap ────────────────────────────────────────────────────────────
interface HeatmapProps { data: Record<number, number> }
export function HourlyHeatmap({ data }: HeatmapProps) {
  const max = Math.max(...Object.values(data), 1);
  const chartData = Array.from({ length: 24 }, (_, h) => ({
    hour: HOURS[h], count: data[h] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="hour" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }}
          formatter={(v: unknown) => [v as number, "Check-ins"] as [number, string]}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {chartData.map((d, i) => {
            const intensity = d.count / max;
            const opacity   = 0.2 + intensity * 0.8;
            return <Cell key={i} fill={`rgba(245,158,11,${opacity})`} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Day-of-week summary ───────────────────────────────────────────────────────
interface DowProps { data: DailyAttendanceDTO[] }
export function DayOfWeekChart({ data }: DowProps) {
  const dow: Record<string, number> = {};
  DAYS.forEach(d => { dow[d] = 0; });
  data.forEach(d => {
    const day = DAYS[new Date(d.date).getDay()];
    dow[day] = (dow[day] ?? 0) + d.count;
  });
  const chartData = DAYS.map(d => ({ day: d, count: dow[d] ?? 0 }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }}
          formatter={(v: unknown) => [v as number, "Check-ins"] as [number, string]}
        />
        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
