"use client";

import { type MemberDetail } from "@/hooks/useMembers";
import { Dumbbell } from "lucide-react";

export default function WorkoutTab({ member }: { member: MemberDetail }) {
  if (!member.workoutPlanId) {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-10 text-center">
        <Dumbbell className="w-10 h-10 text-[#475569] mx-auto mb-3" />
        <p className="font-medium text-[#e2e8f0]">No Workout Plan Assigned</p>
        <p className="text-sm text-[#475569] mt-1">Assign a workout plan from the Workouts module.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-[#f59e0b]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#e2e8f0]">Workout Plan Assigned</h3>
          <p className="text-xs text-[#475569]">ID: {member.workoutPlanId}</p>
        </div>
      </div>
      <p className="text-sm text-[#475569]">View full plan in the Workouts module.</p>
    </div>
  );
}
