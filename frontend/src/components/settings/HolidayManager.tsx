"use client";
import React, { useState } from "react";
import { Plus, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { HolidayDTO, useCreateHoliday, useDeleteHoliday } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const inp = "bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] w-full";

interface Props { holidays: HolidayDTO[]; onChanged: () => void; }

export default function HolidayManager({ holidays, onChanged }: Props) {
  const { mutate: create, saving } = useCreateHoliday();
  const { mutate: del, deleting } = useDeleteHoliday();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", holidayDate: "", isClosed: true, notes: "", isRecurring: false });

  const handleCreate = async () => {
    if (!form.name.trim() || !form.holidayDate) { toast.error("Name and date are required"); return; }
    try {
      await create(form);
      setForm({ name: "", holidayDate: "", isClosed: true, notes: "", isRecurring: false });
      setShowForm(false);
      onChanged();
      toast.success("Holiday added");
    } catch { toast.error("Failed to add holiday"); }
  };

  const handleDelete = async (id: string) => {
    try { await del(id); onChanged(); toast.success("Holiday removed"); }
    catch { toast.error("Failed to remove"); }
  };

  const upcoming = holidays.filter(h => !h.isPast);
  const past = holidays.filter(h => h.isPast);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#475569]">{upcoming.length} upcoming · {past.length} past</span>
        <button onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b] hover:bg-[#2d3f55] rounded-lg text-xs text-[#94a3b8] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Holiday
        </button>
      </div>

      {showForm && (
        <div className="border border-[#1e293b] rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#475569] mb-1">Holiday Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inp} placeholder="Vesak Full Moon Poya" />
            </div>
            <div>
              <label className="block text-xs text-[#475569] mb-1">Date *</label>
              <input type="date" value={form.holidayDate} onChange={e => setForm(p => ({ ...p, holidayDate: e.target.value }))} className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#475569] mb-1">Notes</label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={inp} placeholder="Optional note..." />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
              <input type="checkbox" checked={form.isClosed} onChange={e => setForm(p => ({ ...p, isClosed: e.target.checked }))} className="rounded" />
              Gym closed
            </label>
            <label className="flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
              <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(p => ({ ...p, isRecurring: e.target.checked }))} className="rounded" />
              Recurring yearly
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Add
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-[#1e293b] hover:bg-[#2d3f55] rounded-lg text-sm text-[#94a3b8]">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {upcoming.length === 0 && <p className="text-xs text-[#334155] text-center py-4">No upcoming holidays</p>}
        {upcoming.map(h => (
          <div key={h.id} className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${h.isToday ? "bg-[#f59e0b]/10 border border-[#f59e0b]/20" : "hover:bg-[#111827]"} transition-colors`}>
            <div className="flex items-center gap-3">
              <CalendarDays className={`w-4 h-4 ${h.isToday ? "text-[#f59e0b]" : "text-[#334155]"}`} />
              <div>
                <p className="text-sm text-[#e2e8f0]">{h.name} {h.isToday && <span className="text-xs bg-[#f59e0b] text-black px-1.5 py-0.5 rounded ml-1">Today</span>}</p>
                <p className="text-xs text-[#475569]">{h.holidayDate} {h.isRecurring && "· Recurring"} {h.isClosed ? "· Closed" : "· Modified hours"}</p>
              </div>
            </div>
            <button onClick={() => handleDelete(h.id)} disabled={deleting}
              className="p-1.5 text-[#334155] hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
