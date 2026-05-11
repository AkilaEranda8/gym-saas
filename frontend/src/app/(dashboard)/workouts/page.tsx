"use client";

import { useState } from "react";
import { Dumbbell, Plus, Search, Loader2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import {
  useWorkoutPlans, useWorkoutPlan, useDeleteWorkoutPlan, useWorkoutTemplates,
  useExercises,
  type WorkoutPlan, type WorkoutGoal, type WorkoutLevel,
  type ExerciseCategory, type ExerciseEquipment,
} from "@/hooks/useWorkouts";
import WorkoutPlanCard from "@/components/workouts/WorkoutPlanCard";
import WorkoutStatsCards from "@/components/workouts/WorkoutStatsCards";
import WorkoutPlanFormModal from "@/components/workouts/WorkoutPlanFormModal";
import AssignWorkoutModal from "@/components/workouts/AssignWorkoutModal";
import { GoalBadge, LevelBadge, CategoryBadge } from "@/components/workouts/WorkoutBadges";

const TABS = ["Plans", "Exercise Library"] as const;
type Tab = typeof TABS[number];

const GOALS: WorkoutGoal[] = ["WEIGHT_LOSS","MUSCLE_GAIN","STRENGTH","ENDURANCE","FLEXIBILITY","GENERAL_FITNESS","REHABILITATION","ATHLETIC"];
const LEVELS: WorkoutLevel[] = ["BEGINNER","INTERMEDIATE","ADVANCED","ALL_LEVELS"];
const EX_CATS: ExerciseCategory[] = ["CHEST","BACK","SHOULDERS","ARMS","LEGS","CORE","CARDIO","FULL_BODY","FLEXIBILITY","OTHER"];
const EX_EQUIP: ExerciseEquipment[] = ["BARBELL","DUMBBELL","MACHINE","CABLE","BODYWEIGHT","RESISTANCE_BAND","KETTLEBELL","NONE","OTHER"];

/* ─── Delete Confirmation ─────────────────────────────────── */
function DeleteConfirm({ plan, onClose, onDeleted }: { plan: WorkoutPlan; onClose: () => void; onDeleted: () => void; }) {
  const { remove, loading } = useDeleteWorkoutPlan();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-2">Delete Workout Plan?</h3>
        <p className="text-sm text-gray-500 mb-6">
          "<span className="text-gray-800 font-medium">{plan.name}</span>" will be permanently removed.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={async () => { await remove(plan.id); onDeleted(); }} disabled={loading}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Plan Detail Drawer ──────────────────────────────────── */
function PlanDetailDrawer({ planId, onClose, onEdit }: { planId: string; onClose: () => void; onEdit: () => void; }) {
  const { data: plan, loading } = useWorkoutPlan(planId);
  if (loading) return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <Loader2 size={32} className="text-indigo-600 animate-spin" />
    </div>
  );
  if (!plan) return null;

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1" />
      <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl border-l border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-gray-900">{plan.name}</h2>
            <p className="text-xs text-gray-500">{plan.durationWeeks} weeks · {plan.daysPerWeek} days/week</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium">Edit</button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <GoalBadge goal={plan.goal} />
            <LevelBadge level={plan.level} />
            {plan.template && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Template</span>}
          </div>

          {plan.description && <p className="text-sm text-gray-600">{plan.description}</p>}

          {plan.days.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No workout days configured.</p>
          ) : (
            plan.days.sort((a, b) => a.dayNumber - b.dayNumber).map(day => (
              <div key={day.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{day.dayNumber}</span>
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{day.name ?? `Day ${day.dayNumber}`}</span>
                    {day.focus && <span className="ml-2 text-xs text-gray-500">— {day.focus}</span>}
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{day.exercises.length} exercises</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {day.exercises.map((ex, i) => (
                    <div key={ex.id} className="px-4 py-2.5 flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ex.exerciseName}</p>
                        <p className="text-xs text-gray-500">{ex.sets} sets × {ex.reps ?? "—"} reps{ex.restSeconds ? ` · ${ex.restSeconds}s rest` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function WorkoutsPage() {
  const [tab, setTab] = useState<Tab>("Plans");

  // Plans tab state
  const [search, setSearch] = useState("");
  const [goalFilter, setGoalFilter] = useState<WorkoutGoal | "">("");
  const [levelFilter, setLevelFilter] = useState<WorkoutLevel | "">("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<"create" | "edit" | "assign" | "delete" | "detail" | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [detailPlanId, setDetailPlanId] = useState<string | null>(null);

  const { data: planData, loading: plansLoading, refetch } = useWorkoutPlans({
    goal: goalFilter || undefined,
    level: levelFilter || undefined,
    search: search || undefined,
    page,
    size: 12,
  });
  const { data: templates } = useWorkoutTemplates();

  // Exercise tab state
  const [exSearch, setExSearch] = useState("");
  const [exCat, setExCat] = useState<ExerciseCategory | "">("");
  const [exEquip, setExEquip] = useState<ExerciseEquipment | "">("");
  const [exPage, setExPage] = useState(0);

  const { data: exData, loading: exLoading, refetch: refetchEx } = useExercises({
    category: exCat || undefined,
    equipment: exEquip || undefined,
    search: exSearch || undefined,
    page: exPage,
    size: 20,
  });

  const plans = planData?.content ?? [];
  const totalPlans = planData?.totalElements ?? 0;
  const totalPages = planData?.totalPages ?? 1;

  const exList = exData?.content ?? [];
  const exTotalPages = exData?.totalPages ?? 1;

  const closeModal = () => { setModal(null); setSelectedPlan(null); };
  const onSaved = () => { closeModal(); refetch(); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Workout Plans" />
      <div className="p-6 space-y-5">

        <WorkoutStatsCards
          totalPlans={totalPlans}
          activeAssignments={0}
          totalExercises={exData?.totalElements ?? 0}
          templates={templates.length}
        />

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}>
              {t === "Plans" ? <span className="flex items-center gap-1.5"><Dumbbell size={14} />{t}</span>
                : <span className="flex items-center gap-1.5"><BookOpen size={14} />{t}</span>}
            </button>
          ))}
        </div>

        {/* ── Plans Tab ── */}
        {tab === "Plans" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Search plans…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <select value={goalFilter} onChange={e => { setGoalFilter(e.target.value as any); setPage(0); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Goals</option>
                {GOALS.map(g => <option key={g} value={g}>{g.replace(/_/g," ")}</option>)}
              </select>
              <select value={levelFilter} onChange={e => { setLevelFilter(e.target.value as any); setPage(0); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Levels</option>
                {LEVELS.map(l => <option key={l} value={l}>{l.replace(/_/g," ")}</option>)}
              </select>
              <button onClick={() => setModal("create")}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 whitespace-nowrap">
                <Plus size={16} /> New Plan
              </button>
            </div>

            {plansLoading ? (
              <div className="flex justify-center py-20"><Loader2 size={32} className="text-indigo-600 animate-spin" /></div>
            ) : plans.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                <Dumbbell size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="font-semibold text-gray-700 mb-1">No workout plans found</p>
                <p className="text-sm text-gray-400 mb-5">Create your first plan to get started.</p>
                <button onClick={() => setModal("create")}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2">
                  <Plus size={16} /> Create Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {plans.map(plan => (
                  <WorkoutPlanCard
                    key={plan.id}
                    plan={plan}
                    onClick={p => { setDetailPlanId(p.id); setModal("detail"); }}
                    onEdit={p => { setSelectedPlan(p); setModal("edit"); }}
                    onDelete={p => { setSelectedPlan(p); setModal("delete"); }}
                    onAssign={p => { setSelectedPlan(p); setModal("assign"); }}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Exercise Library Tab ── */}
        {tab === "Exercise Library" && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={exSearch} onChange={e => { setExSearch(e.target.value); setExPage(0); }}
                  placeholder="Search exercises…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <select value={exCat} onChange={e => { setExCat(e.target.value as any); setExPage(0); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Categories</option>
                {EX_CATS.map(c => <option key={c} value={c}>{c.replace(/_/g," ")}</option>)}
              </select>
              <select value={exEquip} onChange={e => { setExEquip(e.target.value as any); setExPage(0); }}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">All Equipment</option>
                {EX_EQUIP.map(e => <option key={e} value={e}>{e.replace(/_/g," ")}</option>)}
              </select>
            </div>

            {exLoading ? (
              <div className="flex justify-center py-20"><Loader2 size={32} className="text-indigo-600 animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Exercise</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Equipment</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Level</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {exList.map(ex => (
                      <tr key={ex.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{ex.name}</div>
                          {ex.description && <div className="text-xs text-gray-400 line-clamp-1">{ex.description}</div>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <CategoryBadge category={ex.category} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs hidden lg:table-cell">
                          {ex.equipment?.replace(/_/g," ") ?? "—"}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {ex.difficulty && <LevelBadge level={ex.difficulty} />}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ex.custom ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                            {ex.custom ? "Custom" : "Global"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {exList.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No exercises found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {exTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setExPage(p => Math.max(0, p - 1))} disabled={exPage === 0}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600">Page {exPage + 1} of {exTotalPages}</span>
                <button onClick={() => setExPage(p => Math.min(exTotalPages - 1, p + 1))} disabled={exPage >= exTotalPages - 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {modal === "detail" && detailPlanId && (
        <PlanDetailDrawer
          planId={detailPlanId}
          onClose={closeModal}
          onEdit={() => {
            const p = plans.find(x => x.id === detailPlanId);
            if (p) setSelectedPlan(p);
            setModal("edit");
          }}
        />
      )}
      {(modal === "create" || modal === "edit") && (
        <WorkoutPlanFormModal
          plan={modal === "edit" ? (selectedPlan as any) : undefined}
          onClose={closeModal}
          onSuccess={onSaved}
        />
      )}
      {modal === "assign" && selectedPlan && (
        <AssignWorkoutModal plan={selectedPlan} onClose={closeModal} onSuccess={onSaved} />
      )}
      {modal === "delete" && selectedPlan && (
        <DeleteConfirm plan={selectedPlan} onClose={closeModal} onDeleted={onSaved} />
      )}
    </div>
  );
}
