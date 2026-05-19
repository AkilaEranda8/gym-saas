"use client";

import React, { useMemo } from "react";
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
    <div className="p-6 space-y-5 max-w-screen-2xl mx-auto">

      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's what's happening today</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
            <Clock className="w-4 h-4" /> Updated just now
          </span>
          <button className="btn-secondary text-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* ── 4 Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <card.icon className={`w-[18px] h-[18px] ${card.iconColor}`} />
              </div>
              <button style={{ color: "var(--border-default)" }}>
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>{card.label}</p>
            <p className="text-[28px] font-bold leading-none mb-3" style={{ color: "var(--text-primary)" }}>
              {kpiLoading ? <span style={{ color: "var(--border-default)" }} className="animate-pulse">···</span> : card.value}
            </p>
            <div className="flex items-center gap-2">
              {card.trend !== null && !kpiLoading && (
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  card.trend >= 0
                    ? "bg-green-500/15 text-green-400 border-green-500/20"
                    : "bg-red-500/15 text-red-400 border-red-500/20"
                }`}>
                  {card.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(card.trend).toFixed(1)}%
                </span>
              )}
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Performance ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Revenue & Expenses Bar Chart */}
        <div className="card lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revenue &amp; Expenses</h3>
              <div className="flex items-center gap-4 mt-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Revenue</span>
                  {kpi && (
                    <>
                      <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
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
                <div className="w-px h-3" style={{ background: "var(--border-default)" }} />
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Expenses</span>
                </div>
              </div>
            </div>
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
            >
              <Calendar className="w-3.5 h-3.5" /> This Year
            </span>
          </div>
          {chartLoad ? (
            <div className="h-56 flex items-center justify-center text-sm animate-pulse" style={{ color: "var(--border-default)" }}>
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e2e8f0" : "#1e2a3a"} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: isLight ? "#64748b" : "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isLight ? "#64748b" : "#475569", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: isLight ? "#ffffff" : "#0f1623", border: `1px solid ${isLight ? "#e2e8f0" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: isLight ? "#475569" : "#94a3b8", fontWeight: 600, marginBottom: 4 }}
                  formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, ""]}
                  cursor={{ fill: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="Revenue"  fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="Expenses" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Performance Panel */}
        <div className="card lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold mb-6" style={{ color: "var(--text-primary)" }}>Performance</h3>

          <div className="space-y-6">
            {[
              { label: "Membership Retention", sub: retentionPct >= 80 ? "Target achieved!" : "Below target", pct: retentionPct, icon: Target, color: "green", gradient: "from-green-600 to-green-400" },
              { label: "Class Fill Rate",       sub: fillRatePct >= 70  ? "Target achieved!" : "Below target", pct: fillRatePct,  icon: Calendar, color: "pink",  gradient: "from-pink-600 to-pink-400" },
              { label: "Shop Revenue Share",    sub: kpi?.shopOrdersCount ? `${kpi.shopOrdersCount} orders` : "No orders yet", pct: shopSharePct, icon: ShoppingBag, color: "violet", gradient: "from-violet-600 to-violet-400" },
            ].map(({ label, sub, pct, icon: Icon, color, gradient }) => (
              <React.Fragment key={label}>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-[18px] h-[18px] text-${color}-400`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-subtle-md)" }}>
                      <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold w-9 text-right flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                      {kpiLoading ? "—" : `${pct.toFixed(0)}%`}
                    </span>
                  </div>
                </div>
                {label !== "Shop Revenue Share" && (
                  <div style={{ borderTop: "1px solid var(--border-subtle)" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Payments Table ────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recent Payments</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}>
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
              <span className="text-sm" style={{ color: "var(--text-placeholder)" }}>Search payments...</span>
            </div>
            <button className="btn-secondary text-xs">
              <SlidersHorizontal size={13} /> Filter
            </button>
            <button className="btn-primary text-xs">
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {["Payment #", "Member Name", "Phone", "Type", "Amount", "Method", "Status", "Date"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payLoad ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 rounded animate-pulse" style={{ width: j === 1 ? 120 : 80, background: "var(--bg-subtle-md)" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No payments found
                  </td>
                </tr>
              ) : (
                rows.map((p: PaymentDTO) => (
                  <tr key={p.id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{p.paymentNumber}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {(p.memberName ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{p.memberName ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{p.memberPhone ?? "—"}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                      {TYPE_LABEL[p.paymentType] ?? p.paymentType}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{p.finalAmountFormatted}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap capitalize text-xs" style={{ color: "var(--text-muted)" }}>
                      {p.method.replace(/_/g, " ").toLowerCase()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_PILL[p.status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
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
  );
}
