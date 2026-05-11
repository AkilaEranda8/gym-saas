"use client";
import React from "react";
import KpiCard from "./KpiCard";
import {
  Users, DollarSign, TrendingUp, Calendar,
  Activity, ShoppingBag, Wrench, Star,
} from "lucide-react";
import type { DashboardKpiDTO } from "@/hooks/useReports";

interface KpiGridProps {
  kpi: DashboardKpiDTO;
}

function fmtLkr(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000)     return (v / 1_000).toFixed(1) + "K";
  return v.toLocaleString();
}

export default function KpiGrid({ kpi }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard
        title="Total Revenue"
        value={fmtLkr(kpi.totalRevenueLkr)}
        prefix="Rs."
        growth={kpi.revenueGrowthPct}
        subtitle="vs last period"
        icon={<DollarSign className="w-4 h-4" />}
        color="gold"
      />
      <KpiCard
        title="Active Members"
        value={kpi.activeMembers}
        subtitle={`${kpi.newMembersThisPeriod} new this period`}
        growth={kpi.memberGrowthPct}
        icon={<Users className="w-4 h-4" />}
        color="blue"
      />
      <KpiCard
        title="Check-ins"
        value={kpi.totalCheckIns.toLocaleString()}
        subtitle={`Avg ${kpi.avgDailyCheckIns.toFixed(1)}/day`}
        icon={<Activity className="w-4 h-4" />}
        color="green"
      />
      <KpiCard
        title="Retention Rate"
        value={kpi.retentionRatePct.toFixed(1)}
        suffix="%"
        subtitle={`Peak: ${kpi.peakDay}`}
        icon={<TrendingUp className="w-4 h-4" />}
        color="purple"
      />
      <KpiCard
        title="Class Sessions"
        value={kpi.totalClassSessions}
        subtitle={`Fill rate: ${kpi.avgFillRatePct.toFixed(1)}%`}
        icon={<Calendar className="w-4 h-4" />}
        color="blue"
      />
      <KpiCard
        title="Shop Revenue"
        value={fmtLkr(kpi.shopRevenueLkr)}
        prefix="Rs."
        subtitle={`${kpi.shopOrdersCount} orders`}
        icon={<ShoppingBag className="w-4 h-4" />}
        color="gold"
      />
      <KpiCard
        title="Open Maintenance"
        value={kpi.openMaintenanceRequests}
        subtitle={`${kpi.serviceOverdueCount} service overdue`}
        icon={<Wrench className="w-4 h-4" />}
        color={kpi.openMaintenanceRequests > 5 ? "red" : "green"}
      />
      <KpiCard
        title="Avg Rev/Member"
        value={fmtLkr(kpi.avgRevenuePerMember)}
        prefix="Rs."
        subtitle="this period"
        icon={<Star className="w-4 h-4" />}
        color="purple"
      />
    </div>
  );
}
