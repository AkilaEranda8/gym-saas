"use client";
import { Dumbbell, Calendar, TrendingUp, XCircle } from "lucide-react";
import { ClassStatsDTO } from "@/hooks/useClasses";

interface Props {
  stats:   ClassStatsDTO | null;
  loading: boolean;
}

export default function ClassStatsCards({ stats, loading }: Props) {
  const cards = [
    {
      label:  "Total Classes",
      value:  stats?.totalClasses ?? 0,
      icon:   Dumbbell,
      color:  "text-blue-400",
      bg:     "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label:  "Sessions This Month",
      value:  stats?.totalSessionsThisMonth ?? 0,
      icon:   Calendar,
      color:  "text-[#f59e0b]",
      bg:     "bg-[#f59e0b]/10",
      border: "border-[#f59e0b]/20",
    },
    {
      label:  "Bookings This Month",
      value:  stats?.totalBookingsThisMonth ?? 0,
      icon:   TrendingUp,
      color:  "text-emerald-400",
      bg:     "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label:  "Cancelled Sessions",
      value:  stats?.cancelledSessionsThisMonth ?? 0,
      icon:   XCircle,
      color:  "text-red-400",
      bg:     "bg-red-500/10",
      border: "border-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`bg-[#111827] border ${border} rounded-xl p-4 space-y-3`}
        >
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-4.5 h-4.5 ${color}`} />
          </div>
          {loading ? (
            <div className="h-8 w-16 bg-[#1e293b] animate-pulse rounded" />
          ) : (
            <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
          )}
          <p className="text-xs text-[#475569]">{label}</p>
        </div>
      ))}
    </div>
  );
}
