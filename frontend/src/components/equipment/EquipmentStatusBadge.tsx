"use client";
import React from "react";
import { EquipmentStatus } from "@/hooks/useEquipment";

const LABELS: Record<EquipmentStatus, string> = {
  OPERATIONAL:      "Operational",
  MAINTENANCE:      "Maintenance",
  OUT_OF_ORDER:     "Out of Order",
  RETIRED:          "Retired",
  UNDER_INSPECTION: "Under Inspection",
};

const COLORS: Record<EquipmentStatus, string> = {
  OPERATIONAL:      "bg-green-500/20 text-green-400",
  MAINTENANCE:      "bg-yellow-500/20 text-yellow-400",
  OUT_OF_ORDER:     "bg-red-500/20 text-red-400",
  RETIRED:          "bg-gray-500/20 text-gray-400",
  UNDER_INSPECTION: "bg-blue-500/20 text-blue-400",
};

export default function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${COLORS[status] ?? "bg-gray-500/20 text-gray-400"}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
