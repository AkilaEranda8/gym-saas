"use client";
import type { EquipmentStatus, EquipmentCondition, MaintenancePriority, MaintenanceStatus, ServiceType } from "@/hooks/useEquipment";

// ── Equipment Status Badge ─────────────────────────────────────────────────────

const STATUS_LABEL: Record<EquipmentStatus, string> = {
  OPERATIONAL:      "Operational",
  MAINTENANCE:      "Maintenance",
  OUT_OF_ORDER:     "Out of Order",
  RETIRED:          "Retired",
  UNDER_INSPECTION: "Under Inspection",
};

const STATUS_CLASS: Record<EquipmentStatus, string> = {
  OPERATIONAL:      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  MAINTENANCE:      "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  OUT_OF_ORDER:     "bg-red-500/10 text-red-400 border border-red-500/20",
  RETIRED:          "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  UNDER_INSPECTION: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ── Equipment Condition Badge ──────────────────────────────────────────────────

const CONDITION_LABEL: Record<EquipmentCondition, string> = {
  EXCELLENT: "Excellent",
  GOOD:      "Good",
  FAIR:      "Fair",
  POOR:      "Poor",
};

const CONDITION_CLASS: Record<EquipmentCondition, string> = {
  EXCELLENT: "bg-emerald-500/10 text-emerald-400",
  GOOD:      "bg-blue-500/10 text-blue-400",
  FAIR:      "bg-amber-500/10 text-amber-400",
  POOR:      "bg-red-500/10 text-red-400",
};

export function EquipmentConditionBadge({ condition }: { condition: EquipmentCondition }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${CONDITION_CLASS[condition]}`}>
      {"★".repeat(condition === "EXCELLENT" ? 5 : condition === "GOOD" ? 4 : condition === "FAIR" ? 3 : 2)}
      <span className="ml-1">{CONDITION_LABEL[condition]}</span>
    </span>
  );
}

// ── Maintenance Priority Badge ─────────────────────────────────────────────────

const PRIORITY_CLASS: Record<MaintenancePriority, string> = {
  LOW:      "bg-slate-500/10 text-slate-400",
  MEDIUM:   "bg-amber-500/10 text-amber-400",
  HIGH:     "bg-orange-500/10 text-orange-400",
  CRITICAL: "bg-red-500/10 text-red-400 border border-red-500/30",
};

export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${PRIORITY_CLASS[priority]}`}>
      {priority === "CRITICAL" && <span className="mr-1">🔴</span>}
      {priority}
    </span>
  );
}

// ── Maintenance Status Badge ───────────────────────────────────────────────────

const MSTATUS_LABEL: Record<MaintenanceStatus, string> = {
  OPEN:        "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED:    "Resolved",
  CLOSED:      "Closed",
  CANCELLED:   "Cancelled",
};

const MSTATUS_CLASS: Record<MaintenanceStatus, string> = {
  OPEN:        "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  RESOLVED:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  CLOSED:      "bg-slate-500/10 text-slate-400",
  CANCELLED:   "bg-red-500/10 text-red-400",
};

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${MSTATUS_CLASS[status]}`}>
      {MSTATUS_LABEL[status]}
    </span>
  );
}

// ── Service Type Badge ─────────────────────────────────────────────────────────

const SERVICE_LABEL: Record<ServiceType, string> = {
  ROUTINE:           "Routine",
  DEEP_CLEAN:        "Deep Clean",
  CALIBRATION:       "Calibration",
  INSPECTION:        "Inspection",
  PARTS_REPLACEMENT: "Parts Replacement",
  OTHER:             "Other",
};

const SERVICE_CLASS: Record<ServiceType, string> = {
  ROUTINE:           "bg-blue-500/10 text-blue-400",
  DEEP_CLEAN:        "bg-cyan-500/10 text-cyan-400",
  CALIBRATION:       "bg-purple-500/10 text-purple-400",
  INSPECTION:        "bg-amber-500/10 text-amber-400",
  PARTS_REPLACEMENT: "bg-orange-500/10 text-orange-400",
  OTHER:             "bg-slate-500/10 text-slate-400",
};

export function ServiceTypeBadge({ serviceType }: { serviceType: ServiceType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${SERVICE_CLASS[serviceType]}`}>
      {SERVICE_LABEL[serviceType]}
    </span>
  );
}

// ── Overdue Indicator ──────────────────────────────────────────────────────────

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      Overdue
    </span>
  );
}

// ── Service Due Soon ───────────────────────────────────────────────────────────

export function ServiceDueBadge({ days }: { days: number }) {
  if (days < 0) return <OverdueBadge />;
  if (days === 0) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">
      Due today
    </span>
  );
  if (days <= 7) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
      Due in {days}d
    </span>
  );
  return null;
}

// ── Inspection Rating ──────────────────────────────────────────────────────────

export function InspectionRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-sm ${star <= rating ? "text-amber-400" : "text-slate-600"}`}>★</span>
      ))}
      <span className="ml-1 text-xs text-slate-400">{rating}/5</span>
    </div>
  );
}
