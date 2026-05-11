"use client";
import { Wrench, CheckCircle, AlertTriangle, XCircle, Clock, Zap } from "lucide-react";
import type { EquipmentStatsDTO } from "@/hooks/useEquipment";

interface Props { stats: EquipmentStatsDTO | null; loading: boolean; }

export default function EquipmentStatsCards({ stats, loading }: Props) {
  const cards = [
    {
      label: "Total Equipment",
      value: stats?.totalEquipment ?? 0,
      sub: `${stats?.operationalCount ?? 0} operational`,
      icon: <Wrench className="w-5 h-5" />,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Operational",
      value: stats?.operationalCount ?? 0,
      sub: `${stats?.underInspectionCount ?? 0} under inspection`,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Needs Attention",
      value: (stats?.maintenanceCount ?? 0) + (stats?.outOfOrderCount ?? 0),
      sub: `${stats?.outOfOrderCount ?? 0} out of order`,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Open Requests",
      value: stats?.openRequestsCount ?? 0,
      sub: `${stats?.criticalRequestsCount ?? 0} critical`,
      icon: <XCircle className="w-5 h-5" />,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Service Overdue",
      value: stats?.serviceOverdueCount ?? 0,
      sub: `${stats?.upcomingServicesThisWeek ?? 0} due this week`,
      icon: <Clock className="w-5 h-5" />,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      label: "Maint. Cost (Month)",
      value: stats?.totalMaintenanceCostThisMonth
        ? `LKR ${(stats.totalMaintenanceCostThisMonth / 1000).toFixed(1)}k`
        : "LKR 0",
      sub: "resolved this month",
      icon: <Zap className="w-5 h-5" />,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[#111827] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <div className={`inline-flex p-2 rounded-lg ${c.bg} ${c.color} mb-3`}>
            {c.icon}
          </div>
          <p className="text-xl font-bold text-[#e2e8f0]">{c.value}</p>
          <p className="text-xs font-medium text-[#e2e8f0] mt-0.5">{c.label}</p>
          <p className="text-xs text-[#475569] mt-0.5">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
