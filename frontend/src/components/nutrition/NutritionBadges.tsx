'use client';

import { NutritionGoal, NutritionAssignmentStatus, FoodCategory, MealTimeOfDay, SupplementTiming } from '@/hooks/useNutrition';

const GOAL_CONFIG: Record<NutritionGoal, { label: string; color: string }> = {
  WEIGHT_LOSS:          { label: 'Weight Loss',       color: 'bg-blue-100 text-blue-700' },
  MUSCLE_GAIN:          { label: 'Muscle Gain',        color: 'bg-red-100 text-red-700' },
  MAINTENANCE:          { label: 'Maintenance',        color: 'bg-gray-100 text-gray-700' },
  BODY_RECOMPOSITION:   { label: 'Body Recomp',        color: 'bg-purple-100 text-purple-700' },
  GENERAL_HEALTH:       { label: 'General Health',     color: 'bg-green-100 text-green-700' },
  ATHLETIC_PERFORMANCE: { label: 'Athletic Perf.',     color: 'bg-orange-100 text-orange-700' },
  VEGAN_PERFORMANCE:    { label: 'Vegan Performance',  color: 'bg-emerald-100 text-emerald-700' },
};

const STATUS_CONFIG: Record<NutritionAssignmentStatus, { label: string; color: string }> = {
  ACTIVE:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  PAUSED:    { label: 'Paused',    color: 'bg-yellow-100 text-yellow-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

const MEAL_TIME_CONFIG: Record<MealTimeOfDay, { label: string; emoji: string }> = {
  BREAKFAST:       { label: 'Breakfast',       emoji: '🌅' },
  MID_MORNING:     { label: 'Mid Morning',     emoji: '☕' },
  LUNCH:           { label: 'Lunch',           emoji: '🌤' },
  AFTERNOON_SNACK: { label: 'Afternoon Snack', emoji: '🍎' },
  PRE_WORKOUT:     { label: 'Pre Workout',     emoji: '💪' },
  POST_WORKOUT:    { label: 'Post Workout',    emoji: '🏋️' },
  DINNER:          { label: 'Dinner',          emoji: '🌙' },
  EVENING_SNACK:   { label: 'Evening Snack',   emoji: '🌃' },
};

export function GoalBadge({ goal }: { goal: NutritionGoal }) {
  const cfg = GOAL_CONFIG[goal] ?? { label: goal, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export function AssignmentStatusBadge({ status }: { status: NutritionAssignmentStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export function MealTimeBadge({ time }: { time: MealTimeOfDay }) {
  const cfg = MEAL_TIME_CONFIG[time] ?? { label: time, emoji: '🍽' };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
      {cfg.emoji} {cfg.label}
    </span>
  );
}

export function FoodCategoryBadge({ category, color }: { category: FoodCategory; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {category.charAt(0) + category.slice(1).toLowerCase()}
    </span>
  );
}

export function MacroBar({ label, grams, total, color }: { label: string; grams: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min((grams / total) * 100, 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-medium">{grams}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function CalorieRing({ current, target, size = 80 }: { current: number; target: number; size?: number }) {
  const pct    = target > 0 ? Math.min(current / target, 1) : 0;
  const r      = size / 2 - 6;
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color  = pct >= 1 ? '#f87171' : pct >= 0.8 ? '#f59e0b' : '#34d399';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-sm font-bold text-gray-800">{current}</div>
        <div className="text-xs text-gray-400">kcal</div>
      </div>
    </div>
  );
}
