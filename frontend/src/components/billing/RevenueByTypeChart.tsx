"use client";
import { RevenueByTypeDTO } from "@/hooks/useBilling";

const TYPE_COLORS: Record<string, string> = {
  MEMBERSHIP:    "#3b82f6",
  PT_SESSION:    "#8b5cf6",
  SHOP_PURCHASE: "#f97316",
  LOCKER:        "#06b6d4",
  CLASS_BOOKING: "#ec4899",
  OTHER:         "#64748b",
};

function fmt(lkr: number) {
  return "Rs. " + (lkr / 100).toLocaleString("en-LK", { maximumFractionDigits: 0 });
}

interface Props { data: RevenueByTypeDTO[]; loading: boolean; }

export default function RevenueByTypeChart({ data, loading }: Props) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue by Type</h3>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-slate-400 text-sm">No data</div>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.paymentType}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: TYPE_COLORS[d.paymentType] ?? "#64748b" }} />
                  <span className="text-xs text-slate-600">{d.paymentType.replace("_", " ")}</span>
                </div>
                <div className="text-xs font-medium text-slate-700">
                  {fmt(d.totalLkr)} <span className="text-slate-400">({d.percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${d.percentage}%`, backgroundColor: TYPE_COLORS[d.paymentType] ?? "#64748b" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
