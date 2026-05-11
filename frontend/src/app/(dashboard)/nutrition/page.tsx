'use client';

import { useState } from 'react';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, X, Flame, Beef, Wheat, Droplets, Clock, Users, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import {
  useNutritionPlans, useNutritionStats, useNutritionPlan, useNutritionTemplates,
  useCreateNutritionPlan, useUpdateNutritionPlan, useDeleteNutritionPlan,
  useNutritionAssignments, useAssignNutritionPlan,
  useFoodItems, useSearchFoodItems, useCreateFoodItem,
  NutritionPlan, NutritionGoal, FoodCategory,
} from '@/hooks/useNutrition';
import { NutritionStatsCards } from '@/components/nutrition/NutritionStatsCards';
import { NutritionPlanCard } from '@/components/nutrition/NutritionPlanCard';
import { NutritionPlanFormModal } from '@/components/nutrition/NutritionPlanFormModal';
import { AssignNutritionModal } from '@/components/nutrition/AssignNutritionModal';
import { GoalBadge, AssignmentStatusBadge, MealTimeBadge, FoodCategoryBadge } from '@/components/nutrition/NutritionBadges';

const GOALS: NutritionGoal[] = ['WEIGHT_LOSS','MUSCLE_GAIN','MAINTENANCE','BODY_RECOMPOSITION','GENERAL_HEALTH','ATHLETIC_PERFORMANCE','VEGAN_PERFORMANCE'];
const FOOD_CATS: FoodCategory[] = ['PROTEIN','CARBS','VEGETABLES','FRUITS','DAIRY','FATS','SUPPLEMENTS','GRAINS','BEVERAGES','OTHER'];
type Tab = 'plans' | 'food' | 'assignments';

export default function NutritionPage() {
  const [tab, setTab]               = useState<Tab>('plans');
  const [search, setSearch]         = useState('');
  const [goalFilter, setGoalFilter] = useState<NutritionGoal | ''>('');
  const [templateOnly, setTemplateOnly] = useState<boolean | undefined>(undefined);
  const [page, setPage]             = useState(0);

  const [selectedPlan, setSelectedPlan]   = useState<NutritionPlan | null>(null);
  const [detailPlanId, setDetailPlanId]   = useState<string | null>(null);
  const [formOpen, setFormOpen]           = useState(false);
  const [editPlan, setEditPlan]           = useState<NutritionPlan | null>(null);
  const [assignOpen, setAssignOpen]       = useState(false);
  const [assignTarget, setAssignTarget]   = useState<NutritionPlan | null>(null);

  const [foodSearch, setFoodSearch]     = useState('');
  const [foodCatFilter, setFoodCatFilter] = useState<FoodCategory | ''>('');
  const [foodPage, setFoodPage]         = useState(0);
  const [foodFormOpen, setFoodFormOpen] = useState(false);

  const { data: stats, loading: statsLoading } = useNutritionStats();
  const { data: plansPage, loading: plansLoading, refresh: refreshPlans } = useNutritionPlans({
    goal: goalFilter || undefined, isTemplate: templateOnly,
    search: search || undefined, page, size: 12,
  });
  const { data: planDetail, loading: detailLoading } = useNutritionPlan(detailPlanId);
  const { data: assignments, loading: assignLoading, refresh: refreshAssignments } = useNutritionAssignments({ page: 0, size: 20 });
  const { data: foodPage2, loading: foodLoading, refresh: refreshFood } = useFoodItems({
    category: foodCatFilter || undefined, search: foodSearch || undefined, page: foodPage, size: 20,
  });

  const { create: createPlan } = useCreateNutritionPlan();
  const { update: updatePlan } = useUpdateNutritionPlan();
  const { remove: deletePlan } = useDeleteNutritionPlan();
  const { assign: assignPlan } = useAssignNutritionPlan();
  const { create: createFood } = useCreateFoodItem();

  const handleCreate = async (data: object) => { await createPlan(data); refreshPlans(); };
  const handleUpdate = async (id: string, data: object) => { await updatePlan(id, data); refreshPlans(); };
  const handleDelete = async (plan: NutritionPlan) => {
    if (!confirm(`Delete "${plan.name}"?`)) return;
    await deletePlan(plan.id); refreshPlans();
  };
  const handleAssign = async (data: object) => { await assignPlan(data); refreshAssignments(); };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'plans',       label: 'Plans' },
    { id: 'food',        label: 'Food Database' },
    { id: 'assignments', label: 'Assignments' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Nutrition Plans" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <NutritionStatsCards stats={stats} loading={statsLoading} />

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Plans Tab ── */}
        {tab === 'plans' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Search plans…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
              </div>
              <select className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={goalFilter} onChange={e => { setGoalFilter(e.target.value as NutritionGoal | ''); setPage(0); }}>
                <option value="">All Goals</option>
                {GOALS.map(g => <option key={g} value={g}>{g.replace(/_/g,' ')}</option>)}
              </select>
              <select className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={templateOnly === undefined ? '' : String(templateOnly)}
                onChange={e => { setTemplateOnly(e.target.value === '' ? undefined : e.target.value === 'true'); setPage(0); }}>
                <option value="">All Types</option>
                <option value="true">Templates Only</option>
                <option value="false">Custom Plans</option>
              </select>
              <button onClick={() => { setEditPlan(null); setFormOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
                <Plus className="w-4 h-4" /> New Plan
              </button>
            </div>

            {plansLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse" />
                ))}
              </div>
            ) : plansPage?.content.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No nutrition plans found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {plansPage?.content.map(plan => (
                  <NutritionPlanCard key={plan.id} plan={plan}
                    onView={p => setDetailPlanId(p.id)}
                    onEdit={p => { setEditPlan(p); setFormOpen(true); }}
                    onDelete={handleDelete}
                    onAssign={p => { setAssignTarget(p); setAssignOpen(true); }}
                  />
                ))}
              </div>
            )}

            {plansPage && plansPage.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-500">{plansPage.totalElements} plans</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={plansPage.first}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">{page + 1} / {plansPage.totalPages}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={plansPage.last}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Food Database Tab ── */}
        {tab === 'food' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Search foods…" value={foodSearch} onChange={e => { setFoodSearch(e.target.value); setFoodPage(0); }} />
              </div>
              <select className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={foodCatFilter} onChange={e => { setFoodCatFilter(e.target.value as FoodCategory | ''); setFoodPage(0); }}>
                <option value="">All Categories</option>
                {FOOD_CATS.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
              </select>
              <button onClick={() => setFoodFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
                <Plus className="w-4 h-4" /> Add Food
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Name','Category','Cal/100g','Protein','Carbs','Fat','Serving','Type'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {foodLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                    ))
                  ) : foodPage2?.content.map(food => (
                    <tr key={food.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{food.name}</div>
                        {food.brand && <div className="text-xs text-gray-400">{food.brand}</div>}
                      </td>
                      <td className="px-4 py-3"><FoodCategoryBadge category={food.category} color={food.categoryColor} /></td>
                      <td className="px-4 py-3 font-medium text-orange-600">{food.caloriesPer100g}</td>
                      <td className="px-4 py-3 text-red-600">{food.proteinPer100g}g</td>
                      <td className="px-4 py-3 text-amber-600">{food.carbsPer100g}g</td>
                      <td className="px-4 py-3 text-purple-600">{food.fatPer100g}g</td>
                      <td className="px-4 py-3 text-gray-500">{food.servingSizeG}{food.servingUnit}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${food.isCustom ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {food.isCustom ? 'Custom' : 'Global'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {foodPage2?.content.length === 0 && !foodLoading && (
                <div className="text-center py-12 text-gray-400 text-sm">No food items found</div>
              )}
            </div>

            {foodPage2 && foodPage2.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{foodPage2.totalElements} items</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setFoodPage(p => Math.max(0, p - 1))} disabled={foodPage2.first}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">{foodPage + 1} / {foodPage2.totalPages}</span>
                  <button onClick={() => setFoodPage(p => p + 1)} disabled={foodPage2.last}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Assignments Tab ── */}
        {tab === 'assignments' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Member','Plan','Goal','Start','End','Status','Assigned By'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                    ))
                  ) : assignments?.content.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{a.memberName ?? a.memberId.slice(0, 8) + '…'}</td>
                      <td className="px-4 py-3 text-gray-700">{a.planName}</td>
                      <td className="px-4 py-3">{a.planGoal && <GoalBadge goal={a.planGoal} />}</td>
                      <td className="px-4 py-3 text-gray-600">{a.startDate}</td>
                      <td className="px-4 py-3 text-gray-600">{a.endDate ?? '—'}</td>
                      <td className="px-4 py-3"><AssignmentStatusBadge status={a.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{a.assignedBy ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {assignments?.content.length === 0 && !assignLoading && (
                <div className="text-center py-12 text-gray-400 text-sm">No assignments yet</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Plan Detail Drawer ── */}
      {detailPlanId && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDetailPlanId(null)} />
          <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">Plan Details</h2>
              <button onClick={() => setDetailPlanId(null)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            {detailLoading ? (
              <div className="p-6 space-y-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded" />)}
              </div>
            ) : planDetail ? (
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <GoalBadge goal={planDetail.goal} />
                    {planDetail.isTemplate && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Template</span>}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{planDetail.name}</h3>
                  {planDetail.description && <p className="text-sm text-gray-500 mt-1">{planDetail.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600">
                    <Flame className="w-4 h-4" /><span className="font-semibold text-lg">{planDetail.caloriesPerDay}</span><span className="text-xs text-gray-400">kcal</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Droplets className="w-4 h-4" /><span className="text-sm">{(planDetail.waterMl / 1000).toFixed(1)}L water</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" /><span className="text-sm">{planDetail.mealsPerDay} meals/day</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" /><span className="text-sm">{planDetail.durationWeeks} weeks</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Macros</h4>
                  {[
                    { label: 'Protein', g: planDetail.proteinG, pct: planDetail.macroSplit?.proteinPercent, color: '#ef4444' },
                    { label: 'Carbs',   g: planDetail.carbsG,   pct: planDetail.macroSplit?.carbsPercent,   color: '#f59e0b' },
                    { label: 'Fat',     g: planDetail.fatG,     pct: planDetail.macroSplit?.fatPercent,     color: '#8b5cf6' },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-3">
                      <span className="w-14 text-xs text-gray-600">{m.label}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${m.pct ?? 0}%`, backgroundColor: m.color }} />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-16 text-right">{m.g}g ({m.pct?.toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>

                {planDetail.meals?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Meal Plan</h4>
                    <div className="space-y-3">
                      {planDetail.meals.map(meal => (
                        <div key={meal.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full text-xs flex items-center justify-center font-bold">{meal.mealNumber}</span>
                            <span className="font-medium text-gray-900 text-sm">{meal.name}</span>
                            <MealTimeBadge time={meal.timeOfDay} />
                          </div>
                          {meal.foodItems?.length > 0 && (
                            <div className="space-y-1 mt-2">
                              {meal.foodItems.map(fi => (
                                <div key={fi.id} className="flex items-center justify-between text-xs text-gray-600 py-0.5">
                                  <span>{fi.foodName} — {fi.quantityG}g</span>
                                  <span className="text-orange-500 font-medium">{Math.round(Number(fi.calories))} kcal</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {planDetail.tags && planDetail.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {planDetail.tags.map(t => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <NutritionPlanFormModal
        open={formOpen} plan={editPlan}
        onClose={() => { setFormOpen(false); setEditPlan(null); }}
        onCreate={handleCreate} onUpdate={handleUpdate}
      />
      <AssignNutritionModal
        open={assignOpen} plan={assignTarget}
        onClose={() => { setAssignOpen(false); setAssignTarget(null); }}
        onAssign={handleAssign}
      />
    </div>
  );
}
