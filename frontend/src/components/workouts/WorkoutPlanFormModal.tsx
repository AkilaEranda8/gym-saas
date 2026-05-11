"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  WorkoutPlanDetail, WorkoutGoal, WorkoutLevel,
  useCreateWorkoutPlan, useUpdateWorkoutPlan, useAllExercises, Exercise,
} from "@/hooks/useWorkouts";

const GOALS: WorkoutGoal[] = ["WEIGHT_LOSS","MUSCLE_GAIN","STRENGTH","ENDURANCE","FLEXIBILITY","GENERAL_FITNESS","REHABILITATION","ATHLETIC"];
const LEVELS: WorkoutLevel[] = ["BEGINNER","INTERMEDIATE","ADVANCED","ALL_LEVELS"];
const GOAL_LABELS: Record<WorkoutGoal, string> = {
  WEIGHT_LOSS:"Weight Loss", MUSCLE_GAIN:"Muscle Gain", STRENGTH:"Strength", ENDURANCE:"Endurance",
  FLEXIBILITY:"Flexibility", GENERAL_FITNESS:"General Fitness", REHABILITATION:"Rehabilitation", ATHLETIC:"Athletic",
};
const LEVEL_LABELS: Record<WorkoutLevel, string> = {
  BEGINNER:"Beginner", INTERMEDIATE:"Intermediate", ADVANCED:"Advanced", ALL_LEVELS:"All Levels",
};

interface DayForm { dayNumber: number; name: string; focus: string; estimatedMinutes: number; exercises: ExForm[]; }
interface ExForm { exerciseId: string; orderIndex: number; sets: string; reps: string; restSeconds: string; notes: string; }

function emptyDay(num: number): DayForm {
  return { dayNumber: num, name: `Day ${num}`, focus: "", estimatedMinutes: 60, exercises: [] };
}
function emptyEx(idx: number): ExForm {
  return { exerciseId: "", orderIndex: idx, sets: "3", reps: "10", restSeconds: "60", notes: "" };
}

interface Props {
  plan?: WorkoutPlanDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WorkoutPlanFormModal({ plan, onClose, onSuccess }: Props) {
  const isEdit = !!plan;
  const { create, loading: creating } = useCreateWorkoutPlan();
  const { update, loading: updating } = useUpdateWorkoutPlan();
  const { data: allExercises } = useAllExercises();
  const loading = creating || updating;

  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [goal, setGoal] = useState<WorkoutGoal>(plan?.goal ?? "GENERAL_FITNESS");
  const [level, setLevel] = useState<WorkoutLevel>(plan?.level ?? "BEGINNER");
  const [daysPerWeek, setDaysPerWeek] = useState(plan?.daysPerWeek ?? 3);
  const [durationWeeks, setDurationWeeks] = useState(plan?.durationWeeks ?? 4);
  const [durationMinutes, setDurationMinutes] = useState(plan?.durationMinutes ?? 60);
  const [isTemplate, setIsTemplate] = useState(plan?.template ?? false);
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [days, setDays] = useState<DayForm[]>(() => {
    if (plan?.days) {
      return plan.days.map(d => ({
        dayNumber: d.dayNumber, name: d.name ?? `Day ${d.dayNumber}`,
        focus: d.focus ?? "", estimatedMinutes: d.estimatedMinutes ?? 60,
        exercises: d.exercises.map((e, i) => ({
          exerciseId: e.exerciseId, orderIndex: i, sets: String(e.sets ?? 3),
          reps: e.reps ?? "10", restSeconds: String(e.restSeconds ?? 60), notes: e.notes ?? "",
        })),
      }));
    }
    return Array.from({ length: 3 }, (_, i) => emptyDay(i + 1));
  });
  const [error, setError] = useState("");
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  useEffect(() => {
    const newDays = Array.from({ length: daysPerWeek }, (_, i) => {
      return days[i] ?? emptyDay(i + 1);
    });
    setDays(newDays);
  }, [daysPerWeek]);

  const addExercise = (dayIdx: number) => {
    const updated = [...days];
    updated[dayIdx].exercises.push(emptyEx(updated[dayIdx].exercises.length));
    setDays(updated);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    const updated = [...days];
    updated[dayIdx].exercises.splice(exIdx, 1);
    setDays(updated);
  };

  const updateExField = (dayIdx: number, exIdx: number, field: keyof ExForm, val: string) => {
    const updated = [...days];
    (updated[dayIdx].exercises[exIdx] as any)[field] = val;
    setDays(updated);
  };

  const buildPayload = () => ({
    name, description, goal, level, daysPerWeek, durationWeeks, durationMinutes,
    template: isTemplate, notes,
    days: days.map(d => ({
      dayNumber: d.dayNumber, name: d.name, focus: d.focus, estimatedMinutes: d.estimatedMinutes,
      exercises: d.exercises
        .filter(e => e.exerciseId)
        .map((e, i) => ({
          exerciseId: e.exerciseId, orderIndex: i,
          sets: parseInt(e.sets) || 3, reps: e.reps,
          restSeconds: parseInt(e.restSeconds) || 60,
          notes: e.notes || undefined,
        })),
    })),
  });

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Plan name is required"); return; }
    try {
      const payload = buildPayload();
      if (isEdit && plan) await update(plan.id, payload);
      else await create(payload);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to save workout plan");
    }
  };

  const exByCategory = allExercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
    const cat = ex.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Workout Plan" : "Create Workout Plan"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Beginner Full Body"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Describe the plan..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <select value={goal} onChange={e => setGoal(e.target.value as WorkoutGoal)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {GOALS.map(g => <option key={g} value={g}>{GOAL_LABELS[g]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value as WorkoutLevel)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days per Week</label>
              <input type="number" min={1} max={7} value={daysPerWeek} onChange={e => setDaysPerWeek(+e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
              <input type="number" min={1} value={durationWeeks} onChange={e => setDurationWeeks(+e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Duration (min)</label>
              <input type="number" min={15} value={durationMinutes} onChange={e => setDurationMinutes(+e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="isTemplate" checked={isTemplate} onChange={e => setIsTemplate(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded" />
              <label htmlFor="isTemplate" className="text-sm text-gray-700">Save as template</label>
            </div>
          </div>

          <div className="border-t pt-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Workout Days</h3>
            <div className="space-y-3">
              {days.map((day, dayIdx) => (
                <div key={dayIdx} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === dayIdx ? null : dayIdx)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                        {day.dayNumber}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{day.name}</span>
                      <span className="text-xs text-gray-500">{day.exercises.length} exercises</span>
                    </div>
                    {expandedDay === dayIdx ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </button>

                  {expandedDay === dayIdx && (
                    <div className="p-4 space-y-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Day Name</label>
                          <input value={day.name} onChange={e => { const u=[...days]; u[dayIdx].name=e.target.value; setDays(u); }}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Focus</label>
                          <input value={day.focus} onChange={e => { const u=[...days]; u[dayIdx].focus=e.target.value; setDays(u); }}
                            placeholder="e.g. Chest & Triceps"
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        </div>
                      </div>

                      {day.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-600">Exercise {exIdx + 1}</span>
                            <button onClick={() => removeExercise(dayIdx, exIdx)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <select value={ex.exerciseId} onChange={e => updateExField(dayIdx, exIdx, "exerciseId", e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="">-- Select Exercise --</option>
                            {Object.entries(exByCategory).map(([cat, exs]) => (
                              <optgroup key={cat} label={cat}>
                                {exs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                              </optgroup>
                            ))}
                          </select>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-gray-500">Sets</label>
                              <input value={ex.sets} onChange={e => updateExField(dayIdx, exIdx, "sets", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Reps</label>
                              <input value={ex.reps} onChange={e => updateExField(dayIdx, exIdx, "reps", e.target.value)}
                                placeholder="10 or 8-12"
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Rest (s)</label>
                              <input value={ex.restSeconds} onChange={e => updateExField(dayIdx, exIdx, "restSeconds", e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                          </div>
                        </div>
                      ))}

                      <button onClick={() => addExercise(dayIdx)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 rounded-lg text-sm transition-colors flex items-center justify-center gap-1">
                        <Plus size={14} /> Add Exercise
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Save Changes" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
