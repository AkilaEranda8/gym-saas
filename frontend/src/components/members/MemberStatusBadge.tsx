"use client";

const CONFIG = {
  ACTIVE:    { dot: "#34d399", bg: "#052e16", text: "#34d399", label: "Active" },
  EXPIRING:  { dot: "#f59e0b", bg: "#2d1a00", text: "#f59e0b", label: "Expiring" },
  EXPIRED:   { dot: "#f87171", bg: "#2d0a0a", text: "#f87171", label: "Expired" },
  SUSPENDED: { dot: "#94a3b8", bg: "#1e293b", text: "#94a3b8", label: "Suspended" },
  INACTIVE:  { dot: "#475569", bg: "#0f172a", text: "#475569", label: "Inactive" },
};

export default function MemberStatusBadge({ status }: { status: string }) {
  const cfg = CONFIG[status as keyof typeof CONFIG] ?? CONFIG.INACTIVE;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}
