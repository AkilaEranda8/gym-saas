"use client";
import React, { useState } from "react";
import { Loader2, ShieldCheck, Monitor, Smartphone, Tablet, AlertTriangle } from "lucide-react";
import {
  AuditSettingsDTO, SecuritySummaryDTO, LoginHistoryDTO,
  useUpdateAuditSettings
} from "@/hooks/useSettings";
import toast from "react-hot-toast";

const inp = "bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] w-full";

const DeviceIcon = ({ type }: { type?: string }) => {
  if (type === "MOBILE") return <Smartphone className="w-3.5 h-3.5 text-[#475569]" />;
  if (type === "TABLET") return <Tablet className="w-3.5 h-3.5 text-[#475569]" />;
  return <Monitor className="w-3.5 h-3.5 text-[#475569]" />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    SUCCESS: "bg-emerald-900/40 text-emerald-400",
    FAILED: "bg-red-900/40 text-red-400",
    BLOCKED: "bg-orange-900/40 text-orange-400",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${map[status] ?? "bg-[#1e293b] text-[#475569]"}`}>{status}</span>;
};

interface Props {
  audit: AuditSettingsDTO;
  summary: SecuritySummaryDTO | null;
  onUpdated: () => void;
}

export default function SecurityPanel({ audit: initAudit, summary, onUpdated }: Props) {
  const { mutate, saving } = useUpdateAuditSettings();
  const [audit, setAudit] = useState(initAudit);
  const [ipInput, setIpInput] = useState((initAudit.allowedIps ?? []).join("\n"));
  const [dirty, setDirty] = useState(false);

  const set = <K extends keyof AuditSettingsDTO>(k: K, v: AuditSettingsDTO[K]) => {
    setAudit(p => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const handleSave = async () => {
    const ips = ipInput.split("\n").map(s => s.trim()).filter(Boolean);
    try {
      await mutate({ ...audit, allowedIps: ips });
      onUpdated();
      setDirty(false);
      toast.success("Security settings saved");
    } catch { toast.error("Failed to save"); }
  };

  const LogRow = ({ h }: { h: LoginHistoryDTO }) => (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${h.isSuspicious ? "bg-red-950/20" : "hover:bg-[#111827]"} transition-colors`}>
      <DeviceIcon type={h.deviceType} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#e2e8f0] truncate">{h.userEmail ?? h.userId}</p>
        <p className="text-[10px] text-[#475569]">{h.ipAddress} · {new Date(h.loggedAt).toLocaleString()}</p>
      </div>
      <StatusBadge status={h.status} />
    </div>
  );

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Logins Today", value: summary.loginAttemptsToday },
            { label: "Failed", value: summary.failedLoginsToday, warn: summary.failedLoginsToday > 5 },
            { label: "Blocked", value: summary.blockedAttempts, warn: summary.blockedAttempts > 0 },
            { label: "Unique IPs", value: summary.uniqueIpsToday },
          ].map(c => (
            <div key={c.label} className={`rounded-xl border p-4 ${c.warn ? "border-red-500/20 bg-red-950/10" : "border-[#1e293b] bg-[#111827]"}`}>
              <p className={`text-xl font-bold ${c.warn ? "text-red-400" : "text-[#e2e8f0]"}`}>{c.value}</p>
              <p className="text-xs text-[#475569] mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {summary && summary.suspiciousActivity.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="text-xs font-semibold text-red-400">Suspicious Activity</p>
          </div>
          <div className="space-y-0.5">{summary.suspiciousActivity.slice(0, 5).map(h => <LogRow key={h.id} h={h} />)}</div>
        </div>
      )}

      {summary && (
        <div>
          <p className="text-xs font-semibold text-[#475569] mb-2">Recent Logins</p>
          <div className="space-y-0.5">{summary.recentLogins.slice(0, 8).map(h => <LogRow key={h.id} h={h} />)}</div>
        </div>
      )}

      <div className="space-y-3 border-t border-[#1e293b] pt-4">
        <p className="text-xs font-semibold text-[#94a3b8]">Audit Settings</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#475569] mb-1">Log Retention (days)</label>
            <input type="number" value={audit.retainDays ?? 90} onChange={e => set("retainDays", Number(e.target.value))} className={inp} min={30} max={365} />
          </div>
        </div>
        {[
          { key: "logLogins" as const, label: "Log Logins" },
          { key: "logDataExports" as const, label: "Log Data Exports" },
          { key: "logPaymentActions" as const, label: "Log Payment Actions" },
          { key: "ipRestrictionEnabled" as const, label: "Enable IP Restriction" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-1">
            <span className="text-sm text-[#94a3b8]">{label}</span>
            <button onClick={() => set(key, !audit[key])}
              className={`relative w-10 h-5 rounded-full transition-colors ${audit[key] ? "bg-[#f59e0b]" : "bg-[#1e293b]"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${audit[key] ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
        {audit.ipRestrictionEnabled && (
          <div>
            <label className="block text-xs text-[#475569] mb-1">Allowed IPs (one per line)</label>
            <textarea rows={4} value={ipInput} onChange={e => { setIpInput(e.target.value); setDirty(true); }}
              className={`${inp} resize-none font-mono`} placeholder="192.168.1.1&#10;10.0.0.0/24" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {dirty ? <span className="text-xs text-[#f59e0b]">Unsaved changes</span> : <span className="text-xs text-[#475569]">All changes saved</span>}
        <button onClick={handleSave} disabled={saving || !dirty}
          className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}
