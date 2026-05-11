"use client";
import { MonthlyRevenueDTO } from "@/hooks/useBilling";

function fmt(lkr: number) {
  if (lkr >= 100000) return "Rs. " + (lkr / 100000).toFixed(1) + "L";
  if (lkr >= 1000)   return "Rs. " + (lkr / 1000).toFixed(1) + "k";
  return "Rs. " + (lkr / 100).toFixed(0);
}

interface Props { data: MonthlyRevenueDTO[]; loading: boolean; }

export default function RevenueChart({ data, loading }: Props) {
  const maxRevenue = Math.max(...data.map(d => d.revenueLkr), 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Revenue</h3>
      {loading ? (
        <div className="h-40 flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 bg-slate-100 rounded animate-pulse"
              style={{ height: `${Math.random() * 70 + 20}%` }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data</div>
      ) : (
        <div className="flex items-end gap-1 h-40">
          {data.map((d) => {
            const height = Math.round((d.revenueLkr / maxRevenue) * 100);
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex flex-col items-center justify-end" style={{ height: "128px" }}>
                  <div
                    className="w-full bg-emerald-500 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${d.month}: ${fmt(d.revenueLkr)}`}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {fmt(d.revenueLkr)}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 rotate-45 origin-left mt-2 whitespace-nowrap">
                  {d.month.slice(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
