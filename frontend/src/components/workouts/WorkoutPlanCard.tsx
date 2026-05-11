"use client";

import { WorkoutPlan } from "@/hooks/useWorkouts";
import { GoalBadge, LevelBadge } from "./WorkoutBadges";
import { Calendar, Clock, Dumbbell, Users, Layers, Pencil, Trash2, Copy } from "lucide-react";

interface Props {
  plan: WorkoutPlan;
  onEdit?: (plan: WorkoutPlan) => void;
  onDelete?: (plan: WorkoutPlan) => void;
  onAssign?: (plan: WorkoutPlan) => void;
  onClick?: (plan: WorkoutPlan) => void;
  selected?: boolean;
}

export default function WorkoutPlanCard({ plan, onEdit, onDelete, onAssign, onClick, selected }: Props) {
  return (
    <div
      onClick={() => onClick?.(plan)}
      className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
        selected ? "border-indigo-500 shadow-md" : "border-gray-200 hover:border-indigo-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {plan.template && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                <Layers size={10} /> Template
              </span>
            )}
            <GoalBadge goal={plan.goal} />
            <LevelBadge level={plan.level} />
          </div>
          <h3 className="font-semibold text-gray-900 truncate text-base">{plan.name}</h3>
          {plan.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{plan.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onAssign && (
            <button
              onClick={e => { e.stopPropagation(); onAssign(plan); }}
              className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
              title="Assign to member"
            >
              <Users size={14} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={e => { e.stopPropagation(); onEdit(plan); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(plan); }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Calendar size={12} className="text-gray-400" />
          <span>{plan.daysPerWeek}d/week</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock size={12} className="text-gray-400" />
          <span>{plan.durationWeeks} wks</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Dumbbell size={12} className="text-gray-400" />
          <span>{plan.dayCount} days</span>
        </div>
      </div>

      {plan.tags && plan.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {plan.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
