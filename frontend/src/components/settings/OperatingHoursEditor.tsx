"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Save, Clock } from "lucide-react";
import { DayScheduleDTO, OperatingHoursDTO, useUpdateOperatingHours } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const DAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const inp = "bg-[#0f172a] border border-[#1e293b] rounded-lg px-2 py-1.5 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] w-28";

interface Props { hours: OperatingHoursDTO; onUpdated: (h: OperatingHoursDTO) => void; }

export default function OperatingHoursEditor({ hours: init, onUpdated }: Props) {
  const { mutate, saving } = useUpdateOperatingHours();
  const [schedule, setSchedule] = useState<DayScheduleDTO[]>(
    init.schedule ?? Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i + 1, dayName: DAY_NAMES[i + 1],
      isOpen: i < 5, openTime: "05:00", closeTime: "22:00",
    }))
  );
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setSchedule(init.schedule); setDirty(false); }, [init]);

  const update = (dayOfWeek: number, key: keyof DayScheduleDTO, value: unknown) => {
    setSchedule(p => p.map(d => d.dayOfWeek === dayOfWeek ? { ...d, [key]: value } : d));
    setDirty(true);
  };

  const copyToAll = (fromDay: DayScheduleDTO) => {
    setSchedule(p => p.map(d => ({ ...d, isOpen: fromDay.isOpen, openTime: fromDay.openTime, closeTime: fromDay.closeTime })));
    setDirty(true);
    toast.success("Copied to all days");
  };

  const handleSave = async () => {
    try {
      const updated = await mutate({ hours: schedule });
      if (updated) { onUpdated(updated); toast.success("Operating hours saved"); setDirty(false); }
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-[#475569]" />
        <span className="text-xs text-[#475569]">
          Status: <span className={init.isOpenNow ? "text-emerald-400" : "text-[#f59e0b]"}>
            {init.isOpenNow ? "Open now" : "Closed"}
          </span>
          {!init.isOpenNow && init.nextOpenTime && ` · Opens ${init.nextOpenTime}`}
        </span>
      </div>

      <div className="space-y-1">
        {schedule.map(day => (
          <div key={day.dayOfWeek}
            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#111827] transition-colors">
            <span className="w-24 text-xs font-medium text-[#94a3b8]">{day.dayName}</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <button onClick={() => update(day.dayOfWeek, "isOpen", !day.isOpen)}
                className={`relative w-8 h-4 rounded-full transition-colors ${day.isOpen ? "bg-[#f59e0b]" : "bg-[#1e293b]"}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${day.isOpen ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className={`text-xs ${day.isOpen ? "text-[#e2e8f0]" : "text-[#475569]"}`}>
                {day.isOpen ? "Open" : "Closed"}
              </span>
            </label>
            {day.isOpen && (
              <>
                <input type="time" value={day.openTime ?? "05:00"}
                  onChange={e => update(day.dayOfWeek, "openTime", e.target.value)}
                  className={inp} />
                <span className="text-xs text-[#475569]">to</span>
                <input type="time" value={day.closeTime ?? "22:00"}
                  onChange={e => update(day.dayOfWeek, "closeTime", e.target.value)}
                  className={inp} />
                <button onClick={() => copyToAll(day)}
                  className="text-[10px] text-[#475569] hover:text-[#f59e0b] ml-auto">
                  Copy to all
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        {dirty ? <span className="text-xs text-[#f59e0b]">Unsaved changes</span> : <span className="text-xs text-[#475569]">All changes saved</span>}
        <button onClick={handleSave} disabled={saving || !dirty}
          className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Hours
        </button>
      </div>
    </div>
  );
}
