"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { useCreateSession, useClasses } from "@/hooks/useClasses";

interface Props {
  onClose:   () => void;
  onCreated: () => void;
}

export default function AddSessionModal({ onClose, onCreated }: Props) {
  const { mutate, loading } = useCreateSession();
  const { data: classes }   = useClasses({ size: 100 });

  const [classId, setClassId]   = useState("");
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("09:00");
  const [notes, setNotes]       = useState("");
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await mutate({ classId, sessionDate: date, startTime: time, notes });
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create session");
    }
  };

  const inputCls = "w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/60 text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#e2e8f0]">Add One-Off Session</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#1e293b] rounded-lg text-[#475569] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#e2e8f0]">Class *</label>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} required className={inputCls}>
              <option value="">Select class...</option>
              {classes?.content.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Start Time *</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputCls} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#e2e8f0]">Notes</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Optional notes..."
              className={inputCls + " resize-none"}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1e293b] text-[#475569] hover:border-[#475569] transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#f59e0b] text-black font-bold hover:bg-[#f59e0b]/90 disabled:opacity-50 transition-colors">
              {loading ? "Creating..." : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
