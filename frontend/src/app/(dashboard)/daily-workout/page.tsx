"use client";

import { useState } from "react";
import {
  Dumbbell, Plus, ChevronLeft, ChevronRight,
  X, Save, Loader2, Trash2, Flame, Clock, Pencil,
} from "lucide-react";
import Header from "@/components/Header";
import {
  useDailyWorkouts, useUpsertWod, useDeleteWod,
  type DailyWorkout, type WodRequest,
} from "@/hooks/useGroups";

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const DIFF_COLOR: Record<string, string> = {
  BEGINNER: "text-[#22c55e] bg-[#22c55e]/10",
  INTERMEDIATE: "text-[#f59e0b] bg-[#f59e0b]/10",
  ADVANCED: "text-[#ef4444] bg-[#ef4444]/10",
};

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function dayNum(d: Date): string {
  return d.toLocaleDateString("en-US", { day: "numeric" });
}

function monthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

type ExRow = { name: string; sets: string; reps: string; weight: string; notes: string };
function emptyRow(): ExRow { return { name: "", sets: "", reps: "", weight: "", notes: "" }; }

function parseExercises(raw: string): ExRow[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return [emptyRow()];
    return arr.map((e: any) => ({
      name: e.name ?? "", sets: String(e.sets ?? ""), reps: String(e.reps ?? ""),
      weight: String(e.weight ?? ""), notes: e.notes ?? "",
    }));
  } catch { return [emptyRow()]; }
}

/* ── WOD Form Modal ─────────────────────────────────────────── */
function WodModal({ date, existing, onClose, onSaved }: {
  date: string; existing?: DailyWorkout | null;
  onClose: () => void; onSaved: () => void;
}) {
  const [title, setTitle]   = useState(existing?.title ?? "");
  const [desc, setDesc]     = useState(existing?.description ?? "");
  const [diff, setDiff]     = useState(existing?.difficulty ?? "");
  const [mins, setMins]     = useState<number | "">(existing?.durationMinutes ?? "");
  const [notes, setNotes]   = useState(existing?.notes ?? "");
  const [rows, setRows]     = useState<ExRow[]>(parseExercises(existing?.exercises ?? "[]"));
  const [err, setErr]       = useState<string | null>(null);

  const { upsert, loading } = useUpsertWod(onSaved);

  const setRow = (i: number, f: keyof ExRow, v: string) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [f]: v } : r));

  const submit = async () => {
    if (!title.trim()) { setErr("Title is required"); return; }
    const exercises = JSON.stringify(
      rows.filter(r => r.name.trim()).map(r => ({
        name: r.name, sets: r.sets || undefined, reps: r.reps || undefined,
        weight: r.weight || undefined, notes: r.notes || undefined,
      }))
    );
    const req: WodRequest = {
      title: title.trim(), description: desc || undefined,
      workoutDate: date, difficulty: diff || undefined,
      durationMinutes: mins !== "" ? Number(mins) : undefined,
      exercises, notes: notes || undefined,
    };
    try { await upsert(req); }
    catch { setErr("Failed to save"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#1e293b]">
          <div>
            <h2 className="font-bold text-[#e2e8f0]">{existing ? "Edit WOD" : "New Daily Workout"}</h2>
            <p className="text-xs text-[#475569]">{new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#475569] hover:text-[#e2e8f0]"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-[#475569] mb-1 block">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Upper Body Strength"
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]" />
            </div>
            <div>
              <label className="text-xs text-[#475569] mb-1 block">Difficulty</label>
              <select value={diff} onChange={e => setDiff(e.target.value)}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]">
                <option value="">— Select —</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#475569] mb-1 block">Duration (min)</label>
              <input type="number" min={1} value={mins}
                onChange={e => setMins(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]"
                placeholder="45" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-[#475569] mb-1 block">Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] resize-none"
                placeholder="Brief description..." />
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-[#e2e8f0]">Exercises</h4>
              <button onClick={() => setRows(p => [...p, emptyRow()])}
                className="text-xs text-[#f59e0b] hover:text-[#fbbf24] flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 bg-[#111827] border border-[#1e293b] rounded-lg p-2.5 items-center">
                  <div className="col-span-4">
                    <input value={r.name} onChange={e => setRow(i, "name", e.target.value)}
                      placeholder="Exercise name"
                      className="w-full bg-[#0f172a] border border-[#1e293b] rounded px-2 py-1 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div className="col-span-2">
                    <input value={r.sets} onChange={e => setRow(i, "sets", e.target.value)}
                      placeholder="Sets"
                      className="w-full bg-[#0f172a] border border-[#1e293b] rounded px-2 py-1 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div className="col-span-2">
                    <input value={r.reps} onChange={e => setRow(i, "reps", e.target.value)}
                      placeholder="Reps"
                      className="w-full bg-[#0f172a] border border-[#1e293b] rounded px-2 py-1 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div className="col-span-3">
                    <input value={r.weight} onChange={e => setRow(i, "weight", e.target.value)}
                      placeholder="Weight"
                      className="w-full bg-[#0f172a] border border-[#1e293b] rounded px-2 py-1 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {rows.length > 1 && (
                      <button onClick={() => setRows(p => p.filter((_, idx) => idx !== i))}
                        className="text-[#ef4444] hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[#475569] mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] resize-none"
              placeholder="Coaching notes..." />
          </div>
        </div>

        {err && <p className="px-5 text-xs text-red-400">{err}</p>}
        <div className="p-5 border-t border-[#1e293b] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#475569] hover:text-[#e2e8f0]">Cancel</button>
          <button onClick={submit} disabled={loading}
            className="px-5 py-2 text-sm font-medium bg-[#f59e0b] text-black rounded-lg hover:bg-[#fbbf24] disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save WOD
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function DailyWorkoutPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [modal, setModal]         = useState<{ date: string; wod?: DailyWorkout } | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const from = fmt(weekDays[0]);
  const to   = fmt(weekDays[6]);
  const { wods, loading, refetch } = useDailyWorkouts(from, to);
  const { deleteWod, loading: deleting } = useDeleteWod(refetch);

  const wodByDate = Object.fromEntries(wods.map(w => [w.workoutDate, w]));

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const today    = fmt(new Date());

  const parseEx = (raw: string) => {
    try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; }
    catch { return []; }
  };

  return (
    <div className="min-h-screen bg-[#080d16]">
      <Header title="Daily Workout" />
      <div className="p-6">
        {/* Week nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevWeek} className="p-2 text-[#475569] hover:text-[#e2e8f0] hover:bg-[#0f172a] rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-[#e2e8f0] text-sm">{monthYear(weekDays[0])}</h2>
          <button onClick={nextWeek} className="p-2 text-[#475569] hover:text-[#e2e8f0] hover:bg-[#0f172a] rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#f59e0b] animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {weekDays.map(day => {
              const dateStr = fmt(day);
              const wod     = wodByDate[dateStr];
              const isToday = dateStr === today;
              const exercises = wod ? parseEx(wod.exercises) : [];

              return (
                <div key={dateStr}
                  className={`bg-[#0f172a] border rounded-xl p-3 flex flex-col gap-2 min-h-[180px] ${
                    isToday ? "border-[#f59e0b]/50" : "border-[#1e293b]"
                  }`}>
                  {/* Day header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-[#475569] uppercase">{dayLabel(day)}</p>
                      <p className={`text-lg font-bold leading-none ${isToday ? "text-[#f59e0b]" : "text-[#e2e8f0]"}`}>
                        {dayNum(day)}
                      </p>
                    </div>
                    {isToday && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#f59e0b]/20 text-[#f59e0b] rounded font-semibold">TODAY</span>
                    )}
                  </div>

                  {wod ? (
                    <div className="flex-1 flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-[#e2e8f0] line-clamp-2 leading-tight">{wod.title}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {wod.difficulty && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${DIFF_COLOR[wod.difficulty] ?? "text-[#94a3b8] bg-[#1e293b]"}`}>
                            {wod.difficulty.charAt(0) + wod.difficulty.slice(1).toLowerCase()}
                          </span>
                        )}
                        {wod.durationMinutes && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1e293b] text-[#475569] flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />{wod.durationMinutes}m
                          </span>
                        )}
                      </div>
                      {exercises.length > 0 && (
                        <ul className="space-y-0.5 mt-0.5">
                          {exercises.slice(0, 3).map((ex: any, i: number) => (
                            <li key={i} className="text-[10px] text-[#475569] flex items-start gap-1">
                              <span className="text-[#334155] mt-px">•</span>
                              <span className="line-clamp-1">{ex.name}{ex.sets ? ` ${ex.sets}×${ex.reps ?? "?"}` : ""}</span>
                            </li>
                          ))}
                          {exercises.length > 3 && (
                            <li className="text-[10px] text-[#334155]">+{exercises.length - 3} more</li>
                          )}
                        </ul>
                      )}
                      <div className="flex gap-1 mt-auto pt-1">
                        <button onClick={() => setModal({ date: dateStr, wod })}
                          className="flex-1 text-[10px] py-1 text-[#f59e0b] hover:bg-[#f59e0b]/10 rounded flex items-center justify-center gap-0.5">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => wod.id && deleteWod(wod.id)} disabled={deleting}
                          className="flex-1 text-[10px] py-1 text-[#ef4444] hover:bg-[#ef4444]/10 rounded flex items-center justify-center gap-0.5">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setModal({ date: dateStr })}
                      className="flex-1 flex flex-col items-center justify-center gap-1.5 text-[#334155] hover:text-[#475569] hover:bg-[#111827] rounded-lg transition-colors group">
                      <Plus className="w-5 h-5 group-hover:text-[#f59e0b]" />
                      <span className="text-[10px]">Add WOD</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Today's WOD highlight */}
        {wodByDate[today] && (
          <div className="mt-6 bg-[#0f172a] border border-[#f59e0b]/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-[#f59e0b]" />
              <h3 className="font-bold text-[#e2e8f0]">Today's Workout</h3>
              {wodByDate[today].difficulty && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${DIFF_COLOR[wodByDate[today].difficulty!] ?? ""}`}>
                  {wodByDate[today].difficulty!.charAt(0) + wodByDate[today].difficulty!.slice(1).toLowerCase()}
                </span>
              )}
            </div>
            <h4 className="text-lg font-semibold text-[#f59e0b] mb-1">{wodByDate[today].title}</h4>
            {wodByDate[today].description && <p className="text-sm text-[#94a3b8] mb-3">{wodByDate[today].description}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {parseEx(wodByDate[today].exercises).map((ex: any, i: number) => (
                <div key={i} className="bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2">
                  <p className="text-sm font-medium text-[#e2e8f0]">{ex.name}</p>
                  <p className="text-xs text-[#475569]">
                    {[ex.sets && `${ex.sets} sets`, ex.reps && `${ex.reps} reps`, ex.weight].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <WodModal date={modal.date} existing={modal.wod}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); refetch(); }} />
      )}
    </div>
  );
}
