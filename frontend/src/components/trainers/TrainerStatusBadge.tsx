"use client";
import { type TrainerStatus, STATUS_COLOR } from "@/hooks/useTrainers";

const LABELS: Record<TrainerStatus, string> = {
  ACTIVE: "Active", INACTIVE: "Inactive", ON_LEAVE: "On Leave",
};

export default function TrainerStatusBadge({ status }: { status: TrainerStatus }) {
  const color = STATUS_COLOR[status] ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: color + "22", color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {LABELS[status]}
    </span>
  );
}
