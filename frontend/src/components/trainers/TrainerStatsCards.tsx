"use client";
import { useTrainerStats } from "@/hooks/useTrainers";
import { Users, Star, UserCheck, TrendingUp } from "lucide-react";

const CARDS = [
  {
    key:      "total"   as const,
    label:    "Total Trainers",
    icon:     Users,
    color:    "#818cf8",
    getValue: (d: ReturnType<typeof useTrainerStats>["data"]) =>
      d ? String(d.totalTrainers) : "—",
    getSub: (d: ReturnType<typeof useTrainerStats>["data"]) =>
      d ? `${d.activeTrainers} active · ${d.onLeaveToday} on leave` : "",
  },
  {
    key:      "rating"  as const,
    label:    "Avg. Rating",
    icon:     Star,
    color:    "#facc15",
    getValue: (d: ReturnType<typeof useTrainerStats>["data"]) =>
      d ? d.averageRating.toFixed(1) : "—",
    getSub: (d: ReturnType<typeof useTrainerStats>["data"]) =>
      d ? `Top: ${d.topRatedTrainerName}` : "",
  },
  {
    key:      "clients" as const,
    label:    "Active PT Clients",
    icon:     UserCheck,
    color:    "#34d399",
    getValue: (d: ReturnType<typeof useTrainerStats>["data"]) =>
      d ? String(d.totalActivePTClients) : "—",
    getSub: () => "Across all trainers",
  },
  {
    key:      "active"  as const,
    label:    "Most Active",
    icon:     TrendingUp,
    color:    "#fb923c",
    getValue: (d: ReturnType<typeof useTrainerStats>["data"]) =>
      d ? d.mostActiveTrainerName : "—",
    getSub: (d: ReturnType<typeof useTrainerStats>["data"]) =>
      d ? `${d.mostActiveTrainerSessions} sessions` : "",
  },
];

export default function TrainerStatsCards() {
  const { data, loading } = useTrainerStats();

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[100px] bg-[#111827] border border-[#1e293b] rounded-2xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(card => (
        <div key={card.key}
          className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
            style={{ background: card.color }} />
          <div className="flex items-start justify-between mb-3">
            <p className="text-[#475569] text-xs font-medium">{card.label}</p>
            <div className="p-2 rounded-xl flex-shrink-0"
              style={{ background: card.color + "18" }}>
              <card.icon className="w-4 h-4" style={{ color: card.color }} />
            </div>
          </div>
          <p className="text-[#e2e8f0] text-2xl font-bold leading-none mb-1 truncate">
            {card.getValue(data)}
          </p>
          <p className="text-[#475569] text-xs truncate">{card.getSub(data)}</p>
        </div>
      ))}
    </div>
  );
}
