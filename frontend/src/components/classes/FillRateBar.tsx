"use client";

interface Props {
  booked: number;
  capacity: number;
}

export default function FillRateBar({ booked, capacity }: Props) {
  const pct  = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
  const full = booked >= capacity;
  const color = full ? "bg-red-500" : pct >= 85 ? "bg-red-400" : pct >= 60 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#475569]">{booked}/{capacity} slots</span>
        {full ? (
          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold text-xs">FULL</span>
        ) : (
          <span className="text-[#e2e8f0]">{pct}%</span>
        )}
      </div>
      <div className="h-1.5 rounded-full bg-[#1e293b]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
