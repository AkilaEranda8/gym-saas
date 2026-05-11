"use client";
import { type EmploymentType } from "@/hooks/useTrainers";

const CONFIG: Record<EmploymentType, { label: string; color: string }> = {
  FULL_TIME: { label: "Full-Time",  color: "#818cf8" },
  PART_TIME: { label: "Part-Time",  color: "#fb923c" },
  CONTRACT:  { label: "Contract",   color: "#22d3ee" },
};

export default function EmploymentBadge({ type }: { type: EmploymentType }) {
  const { label, color } = CONFIG[type] ?? { label: type, color: "#6b7280" };
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: color + "22", color }}
    >
      {label}
    </span>
  );
}
