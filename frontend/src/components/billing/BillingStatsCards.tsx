"use client";
import { BillingSummaryDTO } from "@/hooks/useBilling";
import { TrendingUp, Clock, XCircle, RotateCcw, DollarSign } from "lucide-react";

function fmt(lkr: number) {
  return "Rs. " + (lkr / 100).toLocaleString("en-LK", { minimumFractionDigits: 2 });
}

interface Props { summary: BillingSummaryDTO | null; loading: boolean; }

export default function BillingStatsCards({ summary, loading }: Props) {
  const cards = [
    {
      label: "Total Revenue",
      value: fmt(summary?.paidLkr ?? 0),
      sub: `${summary?.paidCount ?? 0} transactions`,
      icon: DollarSign,
      color: "bg-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending",
      value: fmt(summary?.pendingLkr ?? 0),
      sub: `${summary?.pendingCount ?? 0} unpaid`,
      icon: Clock,
      color: "bg-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Failed",
      value: fmt(summary?.failedLkr ?? 0),
      sub: `${summary?.failedCount ?? 0} failed`,
      icon: XCircle,
      color: "bg-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Refunded",
      value: fmt(summary?.refundedLkr ?? 0),
      sub: `${summary?.refundedCount ?? 0} refunded`,
      icon: RotateCcw,
      color: "bg-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Net Profit",
      value: fmt(summary?.netProfitLkr ?? 0),
      sub: `After expenses`,
      icon: TrendingUp,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{c.label}</span>
              <span className={`${c.bg} p-2 rounded-lg`}>
                <Icon className={`w-4 h-4 ${c.color.replace("bg-", "text-")}`} />
              </span>
            </div>
            {loading ? (
              <div className="h-6 bg-slate-100 rounded animate-pulse" />
            ) : (
              <>
                <div className="text-lg font-bold text-slate-800">{c.value}</div>
                <div className="text-xs text-slate-400 mt-1">{c.sub}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
