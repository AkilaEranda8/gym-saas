"use client";
import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useScheduledReports } from "@/hooks/useReports";

const REPORT_TYPES = [
  "DAILY_SUMMARY","WEEKLY_SUMMARY","MONTHLY_SUMMARY",
  "MEMBER_GROWTH","REVENUE_SUMMARY","ATTENDANCE_SUMMARY",
  "TRAINER_PERFORMANCE","SHOP_SALES","EQUIPMENT_STATUS",
];
const FREQUENCIES = ["DAILY","WEEKLY","MONTHLY"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ScheduledReportModal({ open, onClose }: Props) {
  const { create } = useScheduledReports();
  const [name, setName]         = useState("");
  const [type, setType]         = useState("MONTHLY_SUMMARY");
  const [freq, setFreq]         = useState("MONTHLY");
  const [email, setEmail]       = useState("");
  const [emails, setEmails]     = useState<string[]>([]);
  const [wa, setWa]             = useState("");
  const [waList, setWaList]     = useState<string[]>([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  if (!open) return null;

  const addEmail = () => {
    if (email && !emails.includes(email)) { setEmails([...emails, email]); setEmail(""); }
  };
  const addWa = () => {
    if (wa && !waList.includes(wa)) { setWaList([...waList, wa]); setWa(""); }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true); setError(null);
    try {
      await create({ name, reportType: type, frequency: freq, recipients: emails, whatsappNumbers: waList });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold">Schedule Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-red-400 text-sm">{error}</div>
          )}

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Report Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Monthly Revenue Report"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Report Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/50">
                {REPORT_TYPES.map(t => (
                  <option key={t} value={t} className="bg-[#111827]">
                    {t.replace(/_/g," ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Frequency</label>
              <select value={freq} onChange={e => setFreq(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/50">
                {FREQUENCIES.map(f => (
                  <option key={f} value={f} className="bg-[#111827]">{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email Recipients</label>
            <div className="flex gap-2">
              <input value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addEmail()}
                placeholder="email@example.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/50"
              />
              <button onClick={addEmail} className="px-3 py-2 bg-yellow-400/10 text-yellow-400 rounded-lg hover:bg-yellow-400/20 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {emails.map(e => (
                <span key={e} className="flex items-center gap-1 text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-full">
                  {e}
                  <button onClick={() => setEmails(emails.filter(x => x !== e))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">WhatsApp Numbers</label>
            <div className="flex gap-2">
              <input value={wa} onChange={e => setWa(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addWa()}
                placeholder="+94771234567"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/50"
              />
              <button onClick={addWa} className="px-3 py-2 bg-yellow-400/10 text-yellow-400 rounded-lg hover:bg-yellow-400/20 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {waList.map(w => (
                <span key={w} className="flex items-center gap-1 text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-full">
                  {w}
                  <button onClick={() => setWaList(waList.filter(x => x !== w))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-yellow-400 text-black text-sm font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-50 transition-colors">
            {saving ? "Scheduling…" : "Schedule Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
