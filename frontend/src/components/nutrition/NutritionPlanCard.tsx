'use client';

import { Flame, Beef, Wheat, Droplets, Clock, Users, Pencil, Trash2, Copy } from 'lucide-react';
import { NutritionPlan } from '@/hooks/useNutrition';
import { GoalBadge, MacroBar } from './NutritionBadges';

interface Props {
  plan: NutritionPlan;
  onView?: (plan: NutritionPlan) => void;
  onEdit?: (plan: NutritionPlan) => void;
  onDelete?: (plan: NutritionPlan) => void;
  onAssign?: (plan: NutritionPlan) => void;
}

export function NutritionPlanCard({ plan, onView, onEdit, onDelete, onAssign }: Props) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onView?.(plan)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <GoalBadge goal={plan.goal} />
              {plan.isTemplate && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  Template
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{plan.name}</h3>
            {plan.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{plan.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-orange-600">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-semibold">{plan.caloriesPerDay.toLocaleString()}</span>
            <span className="text-gray-400 text-xs">kcal/day</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            <span>{plan.durationWeeks}w · {plan.mealsPerDay} meals</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Beef className="w-3.5 h-3.5 text-red-400" />
            <span>{plan.proteinG}g protein</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>{(plan.waterMl / 1000).toFixed(1)}L water</span>
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          <MacroBar label="Protein" grams={plan.proteinG} total={plan.macroSplit?.totalCalories / 4} color="#ef4444" />
          <MacroBar label="Carbs"   grams={plan.carbsG}   total={plan.macroSplit?.totalCalories / 4} color="#f59e0b" />
          <MacroBar label="Fat"     grams={plan.fatG}     total={plan.macroSplit?.totalCalories / 9} color="#8b5cf6" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>{plan.assignedMembersCount} assigned</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAssign && (
              <button
                onClick={e => { e.stopPropagation(); onAssign(plan); }}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600"
                title="Assign"
              >
                <Users className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={e => { e.stopPropagation(); onEdit(plan); }}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(plan); }}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
