"use client";
import React from "react";
import { MaintenanceStatus } from "@/hooks/useEquipment";

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  OPEN:        "bg-red-500/20 text-red-400",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-400",
  RESOLVED:    "bg-green-500/20 text-green-400",
  CLOSED:      "bg-gray-500/20 text-gray-400",
  CANCELLED:   "bg-gray-500/10 text-gray-500",
};

export function MaintenanceTypeBadge({ type }: { type: string }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
      {type}
    </span>
  );
}

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? "bg-gray-500/20 text-gray-400"}`}>
      {status}
    </span>
  );
}
