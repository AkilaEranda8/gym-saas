"use client";
import React, { useState } from "react";
import {
  RefreshCw, Download, BarChart2, Users, DollarSign,
  Activity, Calendar, ShoppingBag, Globe, Bell,
} from "lucide-react";
import Header from "@/components/Header";
import KpiGrid from "@/components/reports/KpiGrid";
import DateRangePicker from "@/components/reports/DateRangePicker";
import { RevenueAreaChart, RevenueGrowthChart, RevenueByTypePie } from "@/components/reports/RevenueChart";
import { DailyAttendanceChart, HourlyHeatmap, DayOfWeekChart } from "@/components/reports/AttendanceChart";
import ScheduledReportModal from "@/components/reports/ScheduledReportModal";
import {
  useDashboardKpis, useRevenueReport, useMonthlyRevenueTrend,
  useMemberReport,
  useAttendanceReport, useAttendanceHeatmap,
  useTrainerPerformanceReport, useClassReport,
  useShopReport, useLankaInsights,
  useExportCsv,
} from "@/hooks/useReports";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const TABS = [
  { key: "overview",    label: "Overview",    icon: BarChart2 },
  { key: "revenue",     label: "Revenue",     icon: DollarSign },
  { key: "members",     label: "Members",     icon: Users },
  { key: "attendance",  label: "Attendance",  icon: Activity },
  { key: "trainers",    label: "Trainers",    icon: Calendar },
  { key: "classes",     label: "Classes",     icon: Calendar },
  { key: "shop",        label: "Shop",        icon: ShoppingBag },
  { key: "lanka",       label: "Lanka Insights", icon: Globe },
] as const;
type TabKey = typeof TABS[number]["key"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Skeleton() {
  return <div className="h-56 bg-white/5 animate-pulse rounded-lg" />;
}

function fmtLkr(v: number) {
  if (v >= 1_000_000) return `Rs.${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `Rs.${(v / 1_000).toFixed(0)}K`;
  return `Rs.${v.toLocaleString()}`;
}

export default function ReportsPage() {
  const [tab, setTab]       = useState<TabKey>("overview");
  const [from, setFrom]     = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; });
  const [to, setTo]         = useState(() => new Date().toISOString().slice(0, 10));
  const [schedModal, setSchedModal] = useState(false);

  const { data: kpi,    loading: kpiLoading,  refetch: refetchKpi }    = useDashboardKpis(from, to);
  const { data: rev,    loading: revLoading,  refetch: refetchRev }    = useRevenueReport(from, to);
  const { data: revTrend, loading: trendLoading }                       = useMonthlyRevenueTrend(12);
  const { data: mem,    loading: memLoading,  refetch: refetchMem }    = useMemberReport(from, to);
  const { data: att,    loading: attLoading,  refetch: refetchAtt }    = useAttendanceReport(from, to);
  const { data: heatmap }                                                = useAttendanceHeatmap(from, to);
  const { data: trainer, loading: trainerLoading }                      = useTrainerPerformanceReport(from, to);
  const { data: cls,    loading: clsLoading }                           = useClassReport(from, to);
  const { data: shop,   loading: shopLoading }                          = useShopReport(from, to);
  const { data: lanka,  loading: lankaLoading }                         = useLankaInsights();
  const { download: downloadCsv, loading: dlLoading }                   = useExportCsv();

  return (
    <div className="min-h-screen bg-[#080d16]">
      <Header title="Reports & Analytics" />

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">

        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
          <div className="flex items-center gap-2">
            <button onClick={() => setSchedModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 text-sm rounded-lg hover:bg-white/10 transition-colors border border-white/5">
              <Bell className="w-4 h-4" />
              Schedule
            </button>
            <button
              onClick={() => downloadCsv("REVENUE_SUMMARY", from, to)}
              disabled={dlLoading}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400/10 text-yellow-400 text-sm rounded-lg hover:bg-yellow-400/20 transition-colors border border-yellow-400/20 disabled:opacity-50">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button onClick={() => { refetchKpi(); refetchRev(); refetchMem(); refetchAtt(); }}
              className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-colors border border-white/5">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-white/5">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? "text-yellow-400 border-b-2 border-yellow-400 -mb-px bg-yellow-400/5"
                    : "text-gray-500 hover:text-gray-300"
                }`}>
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Overview Tab ─────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-5">
            {kpiLoading ? <Skeleton /> : kpi ? <KpiGrid kpi={kpi} /> : (
              <div className="text-center text-gray-500 py-12">No data for selected period</div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Section title="Revenue Trend (12 Months)">
                {trendLoading ? <Skeleton /> : <RevenueAreaChart data={revTrend} />}
              </Section>
              <Section title="Attendance — Last 30 Days">
                {attLoading ? <Skeleton /> : att ? <DailyAttendanceChart data={att.dailyAttendance} /> : <Skeleton />}
              </Section>
            </div>
          </div>
        )}

        {/* ── Revenue Tab ───────────────────────────────────────────────────────── */}
        {tab === "revenue" && (
          <div className="space-y-5">
            {rev && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: fmtLkr(rev.totalRevenueLkr) },
                  { label: "Transactions",  value: rev.totalTransactions.toLocaleString() },
                  { label: "Avg Value",     value: fmtLkr(rev.avgTransactionValueLkr) },
                  { label: "Refunded",      value: fmtLkr(rev.refundedLkr) },
                ].map(s => (
                  <div key={s.label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
            <Section title="Monthly Revenue Trend">
              {trendLoading ? <Skeleton /> : <RevenueAreaChart data={revTrend} />}
            </Section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Section title="Month-over-Month Growth">
                {trendLoading ? <Skeleton /> : <RevenueGrowthChart data={revTrend} />}
              </Section>
              <Section title="Revenue by Type">
                {revLoading ? <Skeleton /> : rev?.revenueByType?.length ? (
                  <RevenueByTypePie data={rev.revenueByType} />
                ) : <div className="text-gray-500 text-sm text-center py-8">No breakdown data</div>}
              </Section>
            </div>
          </div>
        )}

        {/* ── Members Tab ───────────────────────────────────────────────────────── */}
        {tab === "members" && (
          <div className="space-y-5">
            {mem && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Members",   value: mem.totalMembers },
                  { label: "Active",          value: mem.activeMembers },
                  { label: "New This Period", value: mem.newMembers },
                  { label: "Expiring Soon",   value: mem.expiringThisWeek },
                ].map(s => (
                  <div key={s.label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-white">{s.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
            <Section title="Member Growth Trend">
              {memLoading ? <Skeleton /> : mem?.growthByMonth?.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={mem.growthByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }} />
                    <Bar dataKey="newMembers"     fill="#3b82f6" name="New"     radius={[3,3,0,0]} />
                    <Bar dataKey="churnedMembers" fill="#ef4444" name="Churned" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="text-gray-500 text-sm text-center py-8">No growth data</div>}
            </Section>
          </div>
        )}

        {/* ── Attendance Tab ────────────────────────────────────────────────────── */}
        {tab === "attendance" && (
          <div className="space-y-5">
            {att && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Check-ins",  value: att.totalCheckIns.toLocaleString() },
                  { label: "Avg Daily",        value: att.avgDailyCheckIns.toFixed(1) },
                  { label: "Peak Hour",        value: att.peakHour },
                  { label: "Peak Day",         value: att.peakDay },
                ].map(s => (
                  <div key={s.label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
            <Section title="Daily Check-ins">
              {attLoading ? <Skeleton /> : att ? <DailyAttendanceChart data={att.dailyAttendance} /> : <Skeleton />}
            </Section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Section title="Hourly Distribution">
                {attLoading ? <Skeleton /> : <HourlyHeatmap data={heatmap} />}
              </Section>
              <Section title="Day of Week">
                {attLoading ? <Skeleton /> : att ? <DayOfWeekChart data={att.dailyAttendance} /> : <Skeleton />}
              </Section>
            </div>
          </div>
        )}

        {/* ── Trainers Tab ──────────────────────────────────────────────────────── */}
        {tab === "trainers" && (
          <div className="space-y-5">
            {trainer && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Trainers",   value: trainer.activeTrainers },
                  { label: "Total Sessions",    value: trainer.totalPTSessions.toLocaleString() },
                  { label: "Completed",         value: trainer.completedSessions.toLocaleString() },
                  { label: "Avg Rating",        value: trainer.avgRatingAllTrainers.toFixed(1) + " ★" },
                ].map(s => (
                  <div key={s.label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
            <Section title="Trainer Performance">
              {trainerLoading ? <Skeleton /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["Trainer","Specialty","Completed","Cancelled","No-show","Clients","Rating"].map(h => (
                          <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {trainer?.trainerStats.map(t => (
                        <tr key={t.trainerId} className="hover:bg-white/2 transition-colors">
                          <td className="py-3 pr-4 text-white font-medium">{t.trainerName}</td>
                          <td className="py-3 pr-4 text-gray-400">{t.specialty}</td>
                          <td className="py-3 pr-4 text-emerald-400">{t.completedSessions}</td>
                          <td className="py-3 pr-4 text-yellow-400">{t.cancelledSessions}</td>
                          <td className="py-3 pr-4 text-red-400">{t.noShowSessions}</td>
                          <td className="py-3 pr-4 text-gray-300">{t.activeClients}</td>
                          <td className="py-3 pr-4 text-yellow-400">{t.avgRating.toFixed(1)} ★</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── Classes Tab ───────────────────────────────────────────────────────── */}
        {tab === "classes" && (
          <div className="space-y-5">
            {cls && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Sessions",   value: cls.totalSessions },
                  { label: "Total Bookings",   value: cls.totalBookings.toLocaleString() },
                  { label: "Avg Fill Rate",    value: `${cls.avgFillRatePct.toFixed(1)}%` },
                  { label: "Cancellation Rate",value: `${cls.cancellationRatePct.toFixed(1)}%` },
                ].map(s => (
                  <div key={s.label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
            <Section title="Sessions by Day of Week">
              {clsLoading ? <Skeleton /> : cls?.sessionsByDay?.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={cls.sessionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="dayOfWeek" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }} />
                    <Bar dataKey="sessionCount"  fill="#3b82f6" name="Sessions" radius={[3,3,0,0]} />
                    <Bar dataKey="bookingCount"  fill="#f59e0b" name="Bookings" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="text-gray-500 text-sm text-center py-8">No data</div>}
            </Section>
          </div>
        )}

        {/* ── Shop Tab ──────────────────────────────────────────────────────────── */}
        {tab === "shop" && (
          <div className="space-y-5">
            {shop && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Shop Revenue",   value: fmtLkr(shop.totalRevenueLkr) },
                  { label: "Total Orders",   value: shop.totalOrders.toLocaleString() },
                  { label: "Avg Order",      value: fmtLkr(shop.avgOrderValueLkr) },
                  { label: "Out of Stock",   value: shop.outOfStockCount },
                ].map(s => (
                  <div key={s.label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
            <Section title="Top Products">
              {shopLoading ? <Skeleton /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        {["#","Product","Category","Units Sold","Revenue"].map(h => (
                          <th key={h} className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {shop?.topProducts.map(p => (
                        <tr key={p.productId}>
                          <td className="py-3 pr-4 text-gray-500">{p.rank}</td>
                          <td className="py-3 pr-4 text-white font-medium">{p.productName}</td>
                          <td className="py-3 pr-4 text-gray-400">{p.categoryName}</td>
                          <td className="py-3 pr-4 text-gray-300">{p.unitsSold}</td>
                          <td className="py-3 pr-4 text-yellow-400 font-medium">{fmtLkr(p.revenueLkr)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── Lanka Insights Tab ────────────────────────────────────────────────── */}
        {tab === "lanka" && (
          <div className="space-y-5">
            {lankaLoading ? <Skeleton /> : lanka && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Payment Peak Day",    value: lanka.paymentPeakDay },
                    { label: "Payday Uplift",       value: `+${lanka.paydayUpliftPct}%` },
                    { label: "WhatsApp Renewal",    value: `${lanka.whatsappRenewalRate}%` },
                    { label: "Monsoon Boost",       value: `+${lanka.monsoonBoostPct}%` },
                  ].map(s => (
                    <div key={s.label} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                      <p className="text-xl font-bold text-white">{s.value}</p>
                    </div>
                  ))}
                </div>

                <Section title={`Avurudu Impact ${lanka.avuruduImpact.year} — Attendance Drop: ${lanka.avuruduImpact.avgAttendanceDrop.toFixed(1)}%`}>
                  <DailyAttendanceChart data={lanka.avuruduImpact.aprilData} />
                </Section>

                <Section title="Seasonal Membership Trends">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={lanka.membershipTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "8px" }} />
                      <Bar dataKey="avgAttendance" name="Avg Attendance" radius={[3,3,0,0]}
                        fill="#3b82f6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Section title="Peak Season Months">
                    <div className="flex flex-wrap gap-2">
                      {lanka.peakSeasonMonths.map(m => (
                        <span key={m} className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded-full text-sm">{m}</span>
                      ))}
                    </div>
                  </Section>
                  <Section title="Low Season Months">
                    <div className="flex flex-wrap gap-2">
                      {lanka.lowSeasonMonths.map(m => (
                        <span key={m} className="px-3 py-1.5 bg-red-400/10 text-red-400 rounded-full text-sm">{m}</span>
                      ))}
                    </div>
                  </Section>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      <ScheduledReportModal open={schedModal} onClose={() => setSchedModal(false)} />
    </div>
  );
}
