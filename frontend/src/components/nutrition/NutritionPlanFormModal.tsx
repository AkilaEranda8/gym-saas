'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { NutritionPlan, NutritionPlanDetail, NutritionGoal, MealTimeOfDay } from '@/hooks/useNutrition';

const GOALS: { value: NutritionGoal; label: string }[] = [
  { value: 'WEIGHT_LOSS',          label: 'Weight Loss' },
  { value: 'MUSCLE_GAIN',          label: 'Muscle Gain' },
  { value: 'MAINTENANCE',          label: 'Maintenance' },
  { value: 'BODY_RECOMPOSITION',   label: 'Body Recomposition' },
  { value: 'GENERAL_HEALTH',       label: 'General Health' },
  { value: 'ATHLETIC_PERFORMANCE', label: 'Athletic Performance' },
  { value: 'VEGAN_PERFORMANCE',    label: 'Vegan Performance' },
];

const MEAL_TIMES: { value: MealTimeOfDay; label: string }[] = [
  { value: 'BREAKFAST',       label: 'Breakfast' },
  { value: 'MID_MORNING',     label: 'Mid Morning' },
  { value: 'LUNCH',           label: 'Lunch' },
  { value: 'AFTERNOON_SNACK', label: 'Afternoon Snack' },
  { value: 'PRE_WORKOUT',     label: 'Pre Workout' },
  { value: 'POST_WORKOUT',    label: 'Post Workout' },
  { value: 'DINNER',          label: 'Dinner' },
  { value: 'EVENING_SNACK',   label: 'Evening Snack' },
];

interface MealInput { mealNumber: number; name: string; timeOfDay: MealTimeOfDay; }
interface FormState {
  name: string; description: string; goal: NutritionGoal; caloriesPerDay: string;
  proteinG: string; carbsG: string; fatG: string; fiberG: string; waterMl: string;
  mealsPerDay: string; durationWeeks: string; isTemplate: boolean; notes: string;
  meals: MealInput[];
}

const DEFAULT_FORM: FormState = {
  name: '', description: '', goal: 'MAINTENANCE',
  caloriesPerDay: '2000', proteinG: '150', carbsG: '200', fatG: '65',
  fiberG: '25', waterMl: '2000', mealsPerDay: '3', durationWeeks: '4',
  isTemplate: false, notes: '', meals: [],
};

interface Props {
  open: boolean;
  plan?: NutritionPlan | null;
  onClose: () => void;
  onCreate: (data: object) => Promise<void>;
  onUpdate: (id: string, data: object) => Promise<void>;
}

export function NutritionPlanFormModal({ open, plan, onClose, onCreate, onUpdate }: Props) {
  const [form, setForm]       = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setForm(DEFAULT_FORM); setError(null); return; }
    if (plan) {
      setForm({
        name: plan.name, description: plan.description ?? '',
        goal: plan.goal, caloriesPerDay: String(plan.caloriesPerDay),
        proteinG: String(plan.proteinG), carbsG: String(plan.carbsG),
        fatG: String(plan.fatG), fiberG: String(plan.fiberG ?? 25),
        waterMl: String(plan.waterMl), mealsPerDay: String(plan.mealsPerDay),
        durationWeeks: String(plan.durationWeeks), isTemplate: plan.isTemplate,
        notes: '', meals: [],
      });
    }
  }, [open, plan]);

  const set = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const addMeal = () => {
    const next = form.meals.length + 1;
    const time = MEAL_TIMES[Math.min(next - 1, MEAL_TIMES.length - 1)].value;
    set('meals', [...form.meals, { mealNumber: next, name: `Meal ${next}`, timeOfDay: time }]);
  };

  const removeMeal = (i: number) =>
    set('meals', form.meals.filter((_, idx) => idx !== i).map((m, idx) => ({ ...m, mealNumber: idx + 1 })));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(null);
    const payload = {
      name: form.name, description: form.description || undefined,
      goal: form.goal, caloriesPerDay: Number(form.caloriesPerDay),
      proteinG: Number(form.proteinG), carbsG: Number(form.carbsG),
      fatG: Number(form.fatG), fiberG: Number(form.fiberG),
      waterMl: Number(form.waterMl), mealsPerDay: Number(form.mealsPerDay),
      durationWeeks: Number(form.durationWeeks), isTemplate: form.isTemplate,
      notes: form.notes || undefined,
      meals: form.meals.length > 0 ? form.meals.map(m => ({ ...m, foodItems: [] })) : undefined,
    };
    try {
      if (plan) await onUpdate(plan.id, payload);
      else       await onCreate(payload);
      onClose();
    } catch (err: any) { setError(err.response?.data?.message ?? 'Failed to save plan'); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{plan ? 'Edit' : 'Create'} Nutrition Plan</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
              <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} required maxLength={100} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className={inp} rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal *</label>
              <select className={inp} value={form.goal} onChange={e => set('goal', e.target.value as NutritionGoal)}>
                {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories / Day *</label>
              <input type="number" className={inp} value={form.caloriesPerDay} onChange={e => set('caloriesPerDay', e.target.value)} min={500} max={10000} required />
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Macros (grams)</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'proteinG', label: 'Protein', color: 'text-red-500' },
                { key: 'carbsG',   label: 'Carbs',   color: 'text-amber-500' },
                { key: 'fatG',     label: 'Fat',     color: 'text-purple-500' },
              ].map(({ key, label, color }) => (
                <div key={key}>
                  <label className={`block text-xs font-medium mb-1 ${color}`}>{label} (g)</label>
                  <input type="number" className={inp} value={form[key as keyof FormState] as string}
                    onChange={e => set(key as keyof FormState, e.target.value)} min={0} required />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiber (g)</label>
              <input type="number" className={inp} value={form.fiberG} onChange={e => set('fiberG', e.target.value)} min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Water (ml)</label>
              <input type="number" className={inp} value={form.waterMl} onChange={e => set('waterMl', e.target.value)} min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meals / Day</label>
              <input type="number" className={inp} value={form.mealsPerDay} onChange={e => set('mealsPerDay', e.target.value)} min={1} max={8} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
              <input type="number" className={inp} value={form.durationWeeks} onChange={e => set('durationWeeks', e.target.value)} min={1} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isTemplate} onChange={e => set('isTemplate', e.target.checked)} className="w-4 h-4 text-violet-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Save as template</span>
              </label>
            </div>
          </div>

          {!plan && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Meal Structure (optional)</span>
                <button type="button" onClick={addMeal}
                  className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium">
                  <Plus className="w-3.5 h-3.5" /> Add Meal
                </button>
              </div>
              {form.meals.length > 0 && (
                <div className="space-y-2">
                  {form.meals.map((meal, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded-full text-xs flex items-center justify-center font-medium shrink-0">{meal.mealNumber}</span>
                      <input className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm" value={meal.name}
                        onChange={e => set('meals', form.meals.map((m, idx) => idx === i ? { ...m, name: e.target.value } : m))} />
                      <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs" value={meal.timeOfDay}
                        onChange={e => set('meals', form.meals.map((m, idx) => idx === i ? { ...m, timeOfDay: e.target.value as MealTimeOfDay } : m))}>
                        {MEAL_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <button type="button" onClick={() => removeMeal(i)} className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-violet-600 rounded-xl text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
              {saving ? 'Saving…' : plan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
