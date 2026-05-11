"use client";

const CONFIG = {
  STANDARD: { bg: "#1e293b", text: "#94a3b8", label: "Standard" },
  PREMIUM:  { bg: "#2d1a00", text: "#f59e0b", label: "Premium" },
  ELITE:    { bg: "#1e0a3c", text: "#a855f7", label: "Elite" },
};

export default function MemberPlanBadge({ plan }: { plan?: string }) {
  if (!plan) return null;
  const cfg = CONFIG[plan as keyof typeof CONFIG] ?? { bg: "#1e293b", text: "#94a3b8", label: plan };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}
