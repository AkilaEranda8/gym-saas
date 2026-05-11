"use client";
import { Edit2, Wrench, Trash2, ExternalLink, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { EquipmentDTO } from "@/hooks/useEquipment";
import { EquipmentStatusBadge, ServiceDueBadge } from "./EquipmentBadges";

interface Props {
  equipment: EquipmentDTO[];
  loading: boolean;
  onEdit: (e: EquipmentDTO) => void;
  onNewRequest: (e: EquipmentDTO) => void;
  onDelete: (e: EquipmentDTO) => void;
}

export default function EquipmentTable({ equipment, loading, onEdit, onNewRequest, onDelete }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-[#0f1729] animate-pulse" />
        ))}
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#475569]">
        <Wrench className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">No equipment found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1e293b]">
      <table className="w-full text-sm">
        <thead className="bg-[#0f1729] text-[#475569] text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Category</th>
            <th className="text-left px-4 py-3">Location</th>
            <th className="text-left px-4 py-3">Brand / Model</th>
            <th className="text-left px-4 py-3">Service</th>
            <th className="text-center px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e293b]">
          {equipment.map((e) => (
            <tr key={e.id} className="hover:bg-[#0f1729] transition-colors">
              <td className="px-4 py-3">
                <Link href={`/equipment/${e.id}`} className="font-medium text-[#e2e8f0] hover:text-[#f59e0b] transition-colors">
                  {e.name}
                </Link>
                {e.serialNumber && <p className="text-xs text-[#475569] font-mono">{e.serialNumber}</p>}
                {e.openRequestsCount > 0 && (
                  <span className="text-xs text-amber-400">{e.openRequestsCount} open request{e.openRequestsCount > 1 ? "s" : ""}</span>
                )}
              </td>
              <td className="px-4 py-3">
                {e.categoryName ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: e.categoryColor ? `${e.categoryColor}20` : "#1e293b", color: e.categoryColor ?? "#94a3b8" }}>
                    {e.categoryName}
                  </span>
                ) : <span className="text-[#475569]">—</span>}
              </td>
              <td className="px-4 py-3 text-[#94a3b8] text-xs">{e.location ?? "—"}</td>
              <td className="px-4 py-3 text-[#475569] text-xs">
                {[e.brand, e.model].filter(Boolean).join(" · ") || "—"}
              </td>
              <td className="px-4 py-3 text-xs">
                <div className="space-y-1">
                  {e.nextServiceDate && (
                    <div className="flex items-center gap-1 text-[#475569]">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(e.nextServiceDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {e.isWarrantyExpired && (
                    <div className="flex items-center gap-1 text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Warranty expired</span>
                    </div>
                  )}
                  <ServiceDueBadge days={e.daysUntilService} />
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <EquipmentStatusBadge status={e.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/equipment/${e.id}`}
                    className="p-1.5 text-[#475569] hover:text-[#f59e0b] hover:bg-[#f59e0b]/10 rounded-lg transition-colors" title="View details">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button onClick={() => onNewRequest(e)}
                    className="p-1.5 text-[#475569] hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors" title="New maintenance request">
                    <Wrench className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(e)}
                    className="p-1.5 text-[#475569] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(e)}
                    className="p-1.5 text-[#475569] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
