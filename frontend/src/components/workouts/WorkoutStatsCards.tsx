"use client";

import { Dumbbell, Users, TrendingUp, Target } from "lucide-react";

interface Props {
  totalPlans: number;
  activeAssignments: number;
  totalExercises: number;
  templates: number;
}

export default function WorkoutStatsCards({ totalPlans, activeAssignments, totalExercises, templates }: Props) {
  const cards = [
    { label: "Workout Plans", value: totalPlans, icon: Dumbbell, color: "bg-indigo-50 text-indigo-600" },
    { label: "Active Assignments", value: activeAssignments, icon: Users, color: "bg-green-50 text-green-600" },
    { label: "Exercises Library", value: totalExercises, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    { label: "Templates", value: templates, icon: Target, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
            <c.icon size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
