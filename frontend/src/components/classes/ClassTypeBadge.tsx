"use client";
import { CLASS_COLORS, CLASS_EMOJIS, ClassType } from "@/hooks/useClasses";

interface Props {
  type: ClassType;
  size?: "sm" | "md";
}

export default function ClassTypeBadge({ type, size = "md" }: Props) {
  const color = CLASS_COLORS[type] ?? "#64748b";
  const emoji = CLASS_EMOJIS[type] ?? "🏃";
  const label = type.charAt(0) + type.slice(1).toLowerCase();
  const pad   = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad}`}
      style={{ backgroundColor: color + "22", color }}
    >
      <span>{emoji}</span>
      {label}
    </span>
  );
}
