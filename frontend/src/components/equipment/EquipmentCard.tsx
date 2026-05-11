"use client";
import { MapPin, QrCode, Wrench, Calendar, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { EquipmentDTO } from "@/hooks/useEquipment";
import { EquipmentStatusBadge, ServiceDueBadge, PriorityBadge } from "./EquipmentBadges";

interface Props {
  equipment: EquipmentDTO;
  onStatusChange?: (id: string) => void;
}

export default function EquipmentCard({ equipment: e, onStatusChange }: Props) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-[#f59e0b]/30 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {e.categoryColor && (
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: e.categoryColor }}
              />
            )}
            <h3 className="font-semibold text-[#e2e8f0] text-sm truncate">{e.name}</h3>
          </div>
          {e.brand && <p className="text-xs text-[#475569] mt-0.5">{e.brand} {e.model && `· ${e.model}`}</p>}
        </div>
        <EquipmentStatusBadge status={e.status} />
      </div>

      <div className="space-y-1.5 mb-3">
        {e.location && (
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{e.location}</span>
          </div>
        )}
        {e.categoryName && (
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <span
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ backgroundColor: e.categoryColor ? `${e.categoryColor}20` : "#1e293b", color: e.categoryColor ?? "#475569" }}
            >
              {e.categoryName}
            </span>
          </div>
        )}
      </div>

      {(e.isServiceOverdue || e.daysUntilService <= 7) && (
        <div className="mb-3">
          <ServiceDueBadge days={e.daysUntilService} />
        </div>
      )}

      {e.openRequestsCount > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <Wrench className="w-3 h-3 text-amber-400" />
          <span className="text-xs text-amber-400">{e.openRequestsCount} open request{e.openRequestsCount > 1 ? "s" : ""}</span>
        </div>
      )}

      {e.isWarrantyExpired && (
        <div className="flex items-center gap-1 mb-3">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-xs text-red-400">Warranty expired</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
        <div className="flex items-center gap-1.5 text-xs text-[#475569]">
          {e.nextServiceDate && (
            <>
              <Calendar className="w-3 h-3" />
              <span>Service: {new Date(e.nextServiceDate).toLocaleDateString()}</span>
            </>
          )}
        </div>
        <Link
          href={`/equipment/${e.id}`}
          className="flex items-center gap-1 text-xs text-[#f59e0b] hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </Link>
      </div>
    </div>
  );
}
