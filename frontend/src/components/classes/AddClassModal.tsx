"use client";
import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useCreateClass, ClassType, ClassDifficulty, CLASS_COLORS, CLASS_EMOJIS } from "@/hooks/useClasses";

const CLASS_TYPES: ClassType[] = ["YOGA","HIIT","ZUMBA","PILATES","BOXING","SPINNING","STRENGTH","MEDITATION","DANCE","CARDIO","CROSSFIT","OTHER"];
const DIFFICULTIES: ClassDifficulty[] = ["ALL_LEVELS","BEGINNER","INTERMEDIATE","ADVANCED"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

interface Props {
  onClose:   () => void;
  onCreated: () => void;
}

export default function AddClassModal({ onClose, onCreated }: Props) {
  const { mutate, loading, error } = useCreateClass();

  const [name, setName]             = useState("");
  const [description, setDesc]      = useState("");
  const [type, setType]             = useState<ClassType>("YOGA");
  const [difficulty, setDiff]       = useState<ClassDifficulty>("ALL_LEVELS");
  const [room, setRoom]             = useState("");
  const [capacity, setCap]          = useState(20);
  const [duration, setDuration]     = useState(60);
  const [isRecurring, setRecurring] = useState(true);
  const [schedules, setSchedules]   = useState<{ dayOfWeek: number; startTime: string; maxCapacity: number }[]>([]);

  const addSchedule = () => setSchedules([...schedules, { dayOfWeek: 1, startTime: "09:00", maxCapacity: capacity }]);
  const removeSchedule = (i: number) => setSchedules(schedules.filter((_, j) => j !== i));
  const updateSchedule = (i: number, key: string, val: string | number) =>
    setSchedules(schedules.map((s, j) => j === i ? { ...s, [key]: val } : s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutate({ name, description, type, difficulty, room, capacity, durationMinutes: duration, isRecurring, schedules });
      onCreated();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#e2e8f0]">Add New Class</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#1e293b] rounded-lg text-[#475569] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#e2e8f0]">Class Name *</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="e.g. Morning Yoga Flow"
              className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/60 text-sm"
            />
          </div>

          {/* Type grid */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#e2e8f0]">Class Type *</label>
            <div className="grid grid-cols-4 gap-2">
              {CLASS_TYPES.map((t) => {
                const color   = CLASS_COLORS[t];
                const emoji   = CLASS_EMOJIS[t];
                const active  = type === t;
                return (
                  <button
                    key={t} type="button"
                    onClick={() => setType(t)}
                    className="rounded-lg p-2 text-center transition-all border text-xs font-medium"
                    style={{
                      borderColor: active ? color : "#1e293b",
                      backgroundColor: active ? color + "22" : "#111827",
                      color: active ? color : "#475569",
                    }}
                  >
                    <div className="text-lg">{emoji}</div>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#e2e8f0]">Difficulty</label>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d} type="button"
                  onClick={() => setDiff(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    difficulty === d
                      ? "bg-[#f59e0b]/20 border-[#f59e0b]/60 text-[#f59e0b]"
                      : "bg-[#111827] border-[#1e293b] text-[#475569] hover:border-[#f59e0b]/30"
                  }`}
                >
                  {d.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Room, Capacity, Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Room</label>
              <input
                value={room} onChange={(e) => setRoom(e.target.value)}
                placeholder="Studio A"
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/60 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Capacity *</label>
              <input
                type="number" min={1} max={200} value={capacity}
                onChange={(e) => setCap(Number(e.target.value))} required
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2.5 text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]/60 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#e2e8f0]">Duration (min) *</label>
              <input
                type="number" min={15} max={240} value={duration}
                onChange={(e) => setDuration(Number(e.target.value))} required
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2.5 text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]/60 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#e2e8f0]">Description</label>
            <textarea
              value={description} onChange={(e) => setDesc(e.target.value)} rows={2}
              placeholder="Brief class description..."
              className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2.5 text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/60 text-sm resize-none"
            />
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between py-2 border-y border-[#1e293b]">
            <div>
              <p className="text-sm font-medium text-[#e2e8f0]">Recurring Class</p>
              <p className="text-xs text-[#475569]">Auto-generate sessions from schedule</p>
            </div>
            <button
              type="button" onClick={() => setRecurring(!isRecurring)}
              className={`w-12 h-6 rounded-full transition-colors ${isRecurring ? "bg-[#f59e0b]" : "bg-[#1e293b]"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${isRecurring ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Schedules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#e2e8f0]">Weekly Schedules</label>
              <button
                type="button" onClick={addSchedule}
                className="flex items-center gap-1 text-xs text-[#f59e0b] hover:text-[#f59e0b]/80 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Schedule
              </button>
            </div>
            {schedules.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#111827] border border-[#1e293b] rounded-lg p-3">
                <select
                  value={s.dayOfWeek}
                  onChange={(e) => updateSchedule(i, "dayOfWeek", Number(e.target.value))}
                  className="bg-[#080d16] border border-[#1e293b] rounded px-2 py-1 text-xs text-[#e2e8f0]"
                >
                  {DAYS.map((d, j) => <option key={d} value={j + 1}>{d}</option>)}
                </select>
                <input
                  type="time" value={s.startTime}
                  onChange={(e) => updateSchedule(i, "startTime", e.target.value)}
                  className="bg-[#080d16] border border-[#1e293b] rounded px-2 py-1 text-xs text-[#e2e8f0]"
                />
                <input
                  type="number" min={1} max={200} value={s.maxCapacity} placeholder="Cap"
                  onChange={(e) => updateSchedule(i, "maxCapacity", Number(e.target.value))}
                  className="w-16 bg-[#080d16] border border-[#1e293b] rounded px-2 py-1 text-xs text-[#e2e8f0]"
                />
                <button type="button" onClick={() => removeSchedule(i)}
                  className="ml-auto text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1e293b] text-[#475569] hover:text-[#e2e8f0] hover:border-[#475569] transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#f59e0b] text-black font-bold hover:bg-[#f59e0b]/90 disabled:opacity-50 transition-colors">
              {loading ? "Creating..." : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
