"use client";
import { SPECIALTY_COLOR, SPECIALTY_EMOJI, type TrainerSpecialty } from "@/hooks/useTrainers";

export default function SpecialtyBadge({
  specialty, showEmoji = true,
}: { specialty: string; showEmoji?: boolean }) {
  const key = specialty as TrainerSpecialty;
  const color = SPECIALTY_COLOR[key] ?? "#64748b";
  const emoji = SPECIALTY_EMOJI[key] ?? "🎯";
  const label = specialty.replace(/_/g, " ");
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: color + "20", color }}
    >
      {showEmoji && <span>{emoji}</span>}
      {label}
    </span>
  );
}
