"use client";

export default function AttendanceBar({ percentage }: { percentage: number }) {
  const pct = Math.max(0, Math.min(100, percentage));
  const color = pct >= 70 ? "#34d399" : pct >= 40 ? "#f59e0b" : "#f87171";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}
