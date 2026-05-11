'use client';

import { ClipboardList, Users, LayoutTemplate, CalendarDays } from 'lucide-react';
import { NutritionStats } from '@/hooks/useNutrition';

export function NutritionStatsCards({ stats, loading }: { stats: NutritionStats | null; loading: boolean }) {
  const cards = [
    { label: 'Total Plans',       value: stats?.totalPlans ?? 0,         icon: ClipboardList, color: 'bg-blue-50 text-blue-600' },
    { label: 'Templates',         value: stats?.templatePlans ?? 0,      icon: LayoutTemplate, color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Assignments',value: stats?.activeAssignments ?? 0,  icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Logs This Month',   value: stats?.logsThisMonth ?? 0,      icon: CalendarDays, color: 'bg-orange-50 text-orange-600' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-lg mb-3" />
            <div className="h-6 w-16 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  );
}
