"use client";
import React from "react";
import { Lock, CheckCircle, Users, Wrench, AlertTriangle, DollarSign } from "lucide-react";
import type { LockerStatsDTO } from "@/hooks/useLockers";

interface Props { stats: LockerStatsDTO }

export default function LockerStatsCards({ stats }: Props) {
  const cards = [
    { label: "Total Lockers",       value: stats.total,              icon: Lock,          color: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Available",           value: stats.available,          icon: CheckCircle,   color: "text-green-400",  bg: "bg-green-500/10" },
    { label: "Occupied",            value: stats.occupied,           icon: Users,         color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Maintenance",         value: stats.maintenance,        icon: Wrench,        color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Expiring This Week",  value: stats.expiringThisWeek,   icon: AlertTriangle, color: "text-red-400",    bg: "bg-red-500/10" },
    { label: "Monthly Revenue",     value: `Rs. ${Number(stats.monthlyRevenue).toLocaleString()}`, icon: DollarSign, color: "text-purple-400", bg: "bg-purple-500/10", isText: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, isText }) => (
        <div key={label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <p className="text-2xl font-bold text-white">{isText ? value : value}</p>
          <p className="text-xs text-gray-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
