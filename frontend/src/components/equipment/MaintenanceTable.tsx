"use client";
import { Wrench, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { MaintenanceRequestDTO } from "@/hooks/useEquipment";
import { PriorityBadge, MaintenanceStatusBadge, OverdueBadge } from "./EquipmentBadges";

interface Props {
  requests: MaintenanceRequestDTO[];
  loading: boolean;
  onStatusClick?: (r: MaintenanceRequestDTO) => void;
}

export default function MaintenanceTable({ requests, loading, onStatusClick }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-[#0f1729] animate-pulse" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#475569]">
        <Wrench className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No maintenance requests</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1e293b]">
      <table className="w-full text-sm">
        <thead className="bg-[#0f1729] text-[#475569] text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3">Request #</th>
            <th className="text-left px-4 py-3">Equipment</th>
            <th className="text-left px-4 py-3">Title</th>
            <th className="text-left px-4 py-3">Priority</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Assigned To</th>
            <th className="text-right px-4 py-3">Cost (LKR)</th>
            <th className="text-left px-4 py-3">Due</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e293b]">
          {requests.map((r) => (
            <tr key={r.id} className="hover:bg-[#0f1729] transition-colors">
              <td className="px-4 py-3">
                <span className="text-xs font-mono text-[#94a3b8]">{r.requestNumber}</span>
              </td>
              <td className="px-4 py-3 text-[#94a3b8] text-xs max-w-[120px] truncate">
                {r.equipmentName ?? "—"}
              </td>
              <td className="px-4 py-3 max-w-[200px]">
                <p className="text-[#e2e8f0] text-xs font-medium truncate">{r.title}</p>
                {r.isOverdue && <OverdueBadge />}
              </td>
              <td className="px-4 py-3"><PriorityBadge priority={r.priority} /></td>
              <td className="px-4 py-3">
                <button onClick={() => onStatusClick?.(r)} className="cursor-pointer">
                  <MaintenanceStatusBadge status={r.status} />
                </button>
              </td>
              <td className="px-4 py-3 text-[#94a3b8] text-xs">{r.assignedToName ?? "Unassigned"}</td>
              <td className="px-4 py-3 text-right text-[#94a3b8] text-xs">
                {r.actualCostLkr != null
                  ? `LKR ${r.actualCostLkr.toLocaleString()}`
                  : r.estimatedCostLkr != null
                  ? <span className="text-[#475569]">~{r.estimatedCostLkr.toLocaleString()}</span>
                  : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-[#475569]">
                {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
