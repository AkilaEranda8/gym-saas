"use client";

import React, { useMemo } from "react";
import Header from "@/components/Header";
import { useDashboardKpis, useMonthlyRevenueTrend } from "@/hooks/useReports";
import { usePayments, type PaymentDTO } from "@/hooks/useBilling";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  DollarSign, Users, Activity, UserPlus,
  ArrowUpRight, ArrowDownRight,
  Search, SlidersHorizontal, Download,
  MoreHorizontal, Clock, Target, Calendar, ShoppingBag,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

function today()        { return new Date().toISOString().split("T")[0]; }
function startOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

const STATUS_PILL: Record<string, string> = {
  PAID:      "bg-green-500/20 text-green-400 border-green-500/30",
  PENDING:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FAILED:    "bg-red-500/20 text-red-400 border-red-500/30",
  REFUNDED:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};
const TYPE_LABEL: Record<string, string> = {
  MEMBERSHIP:    "Membership",
  PT_SESSION:    "PT Session",
  SHOP_PURCHASE: "Shop",
  LOCKER:        "Locker",
  CLASS_BOOKING: "Class",
  OTHER:         "Other",
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const { data: kpi, loading: kpiLoading }   = useDashboardKpis(startOfMonth(), today());
  const { data: monthly, loading: chartLoad } = useMonthlyRevenueTrend(12);
  const { payments, loading: payLoad }        = usePayments({ size: 8 });
  const rows = payments?.content ?? [];

  const chartData = useMemo(() =>
    monthly.slice(-12).map(d => ({
      name:     d.label,
      Revenue:  d.revenueLkr,
      Expenses: d.expensesLkr,
    })),
  [monthly]);

  const retentionPct = kpi?.retentionRatePct  ?? 0;
  const fillRatePct  = kpi?.avgFillRatePct    ?? 0;
  const shopSharePct = kpi && kpi.totalRevenueLkr > 0
    ? Math.round((kpi.shopRevenueLkr / kpi.totalRevenueLkr) * 100)
    : 0;

  const STAT_CARDS = [
    {
      label:      "Total Revenue",
      value:      kpi ? `Rs. ${(kpi.totalRevenueLkr / 1000).toFixed(1)}K` : "—",
      trend:      kpi?.revenueGrowthPct ?? null,
      sub:        "vs last month",
      icon:       DollarSign,
      iconBg:     "bg-blue-500/10",
      iconColor:  "text-blue-400",
    },
    {
      label:      "Active Members",
      value:      kpi?.activeMembers?.toLocaleString() ?? "—",
      trend:      kpi?.memberGrowthPct ?? null,
      sub:        "vs last month",
      icon:       Users,
      iconBg:     "bg-violet-500/10",
      iconColor:  "text-violet-400",
    },
    {
      label:      "Total Check-ins",
      value:      kpi?.totalCheckIns?.toLocaleString() ?? "—",
      trend:      null,
      sub:        `~${kpi?.avgDailyCheckIns ?? 0}/day avg`,
      icon:       Activity,
      iconBg:     "bg-pink-500/10",
      iconColor:  "text-pink-400",
    },
    {
      label:      "New Members",
      value:      kpi?.newMembersThisPeriod?.toLocaleString() ?? "—",
      trend:      null,
      sub:        "this month",
      icon:       UserPlus,
      iconBg:     "bg-amber-500/10",
      iconColor:  "text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Header title="Dashboard" />

      <div className="p-6 space-y-5">

        {/* ── Top action row ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>Last update just now</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#161b27] border border-gray-700 rounded-xl text-gray-300 text-sm hover:bg-gray-800 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* ── 4 Stat Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STAT_CARDS.map(card => (
            <div key={card.label} className="bg-[#161b27] border border-gray-800/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-[18px] h-[18px] ${card.iconColor}`} />
                </div>
                <button className="text-gray-700 hover:text-gray-500 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
              <p className="text-[28px] font-bold text-white leading-none mb-3">
                {kpiLoading ? <span className="text-gray-700 animate-pulse">···</span> : card.value}
              </p>
              <div className="flex items-center gap-2">
                {card.trend !== null && !kpiLoading && (
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    card.trend >= 0
                      ? "bg-green-500/15 text-green-400 border-green-500/20"
                      : "bg-red-500/15 text-red-400 border-red-500/20"
                  }`}>
                    {card.trend >= 0
                      ? <ArrowUpRight className="w-3 h-3" />
                      : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(card.trend).toFixed(1)}%
                  </span>
                )}
                <span className="text-xs text-gray-500">{card.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart + Performance ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Revenue & Expenses Bar Chart */}
          <div className="lg:col-span-3 bg-[#161b27] border border-gray-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Revenue &amp; Expenses</h3>
                <div className="flex items-center gap-4 mt-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs text-gray-400">Revenue</span>
                    {kpi && (
                      <>
                        <span className="text-xs font-bold text-white">
                          Rs. {(kpi.totalRevenueLkr / 1000).toFixed(0)}K
                        </span>
                        {kpi.revenueGrowthPct != null && (
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            kpi.revenueGrowthPct >= 0 ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                          }`}>
                            {kpi.revenueGrowthPct >= 0 ? "↑" : "↓"}{Math.abs(kpi.revenueGrowthPct).toFixed(1)}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="w-px h-3 bg-gray-700" />
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    <span className="text-xs text-gray-400">Expenses</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300">
                  <Calendar className="w-3.5 h-3.5" /> This Year
                </span>
                <button className="text-gray-700 hover:text-gray-500 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
            {chartLoad ? (
              <div className="h-56 flex items-center justify-center text-gray-700 text-sm animate-pulse">
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1f2937"} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: isLight ? "#64748b" : "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: isLight ? "#64748b" : "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: isLight ? "#ffffff" : "#111827", border: `1px solid ${isLight ? "#e2e8f0" : "#374151"}`, borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: isLight ? "#475569" : "#9ca3af", fontWeight: 600, marginBottom: 4 }}
                    formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, ""]}
                    cursor={{ fill: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="Revenue"  fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="Expenses" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Performance Panel */}
          <div className="lg:col-span-2 bg-[#161b27] border border-gray-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white">Performance</h3>
              <button className="text-gray-700 hover:text-gray-500 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Membership Retention */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-[18px] h-[18px] text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">Membership Retention</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {retentionPct >= 80 ? "Retention target achieved!" : "Below retention target"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(retentionPct, 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-white w-9 text-right flex-shrink-0">
                    {kpiLoading ? "—" : `${retentionPct.toFixed(0)}%`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-800/60" />

              {/* Class Fill Rate */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-[18px] h-[18px] text-pink-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">Class Fill Rate</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fillRatePct >= 70 ? "Fill rate target achieved!" : "Below fill rate target"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(fillRatePct, 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-white w-9 text-right flex-shrink-0">
                    {kpiLoading ? "—" : `${fillRatePct.toFixed(0)}%`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-800/60" />

              {/* Shop Revenue Share */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-[18px] h-[18px] text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">Shop Revenue Share</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {kpi?.shopOrdersCount
                        ? `${kpi.shopOrdersCount} orders this period`
                        : "No shop orders yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(shopSharePct, 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-white w-9 text-right flex-shrink-0">
                    {kpiLoading ? "—" : `${shopSharePct}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Payments Table ────────────────────────────── */}
        <div className="bg-[#161b27] border border-gray-800/60 rounded-2xl overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/60">
            <h3 className="text-sm font-semibold text-white">Recent Payments</h3>
            <button className="text-gray-700 hover:text-gray-500 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Search + Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/40 gap-4">
            <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2 flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-500 text-sm">Search payments...</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 text-sm hover:text-white hover:bg-gray-700 transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-medium transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/60">
                  {["Payment #", "Member Name", "Phone", "Type", "Amount", "Method", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {payLoad ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: j === 1 ? 120 : 80 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center text-gray-600 text-sm">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  rows.map((p: PaymentDTO) => (
                    <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-400">{p.paymentNumber}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {(p.memberName ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-200 font-medium whitespace-nowrap">{p.memberName ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{p.memberPhone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-gray-300 whitespace-nowrap">
                        {TYPE_LABEL[p.paymentType] ?? p.paymentType}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-white whitespace-nowrap">{p.finalAmountFormatted}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap capitalize text-xs">
                        {p.method.replace(/_/g, " ").toLowerCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_PILL[p.status] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
