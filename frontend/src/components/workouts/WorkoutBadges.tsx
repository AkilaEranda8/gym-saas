"use client";

import { WorkoutGoal, WorkoutLevel, ExerciseCategory, AssignmentStatus, WorkoutLogStatus } from "@/hooks/useWorkouts";

const GOAL_CONFIG: Record<WorkoutGoal, { label: string; color: string }> = {
  WEIGHT_LOSS:     { label: "Weight Loss",     color: "bg-orange-100 text-orange-700" },
  MUSCLE_GAIN:     { label: "Muscle Gain",     color: "bg-blue-100 text-blue-700" },
  STRENGTH:        { label: "Strength",        color: "bg-red-100 text-red-700" },
  ENDURANCE:       { label: "Endurance",       color: "bg-green-100 text-green-700" },
  FLEXIBILITY:     { label: "Flexibility",     color: "bg-purple-100 text-purple-700" },
  GENERAL_FITNESS: { label: "General Fitness", color: "bg-teal-100 text-teal-700" },
  REHABILITATION:  { label: "Rehabilitation",  color: "bg-yellow-100 text-yellow-700" },
  ATHLETIC:        { label: "Athletic",        color: "bg-indigo-100 text-indigo-700" },
};

const LEVEL_CONFIG: Record<WorkoutLevel, { label: string; color: string }> = {
  BEGINNER:     { label: "Beginner",     color: "bg-green-100 text-green-700" },
  INTERMEDIATE: { label: "Intermediate", color: "bg-yellow-100 text-yellow-700" },
  ADVANCED:     { label: "Advanced",     color: "bg-red-100 text-red-700" },
  ALL_LEVELS:   { label: "All Levels",   color: "bg-gray-100 text-gray-700" },
};

const CAT_CONFIG: Record<ExerciseCategory, { label: string; color: string }> = {
  CHEST:       { label: "Chest",       color: "bg-red-100 text-red-700" },
  BACK:        { label: "Back",        color: "bg-blue-100 text-blue-700" },
  SHOULDERS:   { label: "Shoulders",   color: "bg-purple-100 text-purple-700" },
  ARMS:        { label: "Arms",        color: "bg-pink-100 text-pink-700" },
  LEGS:        { label: "Legs",        color: "bg-orange-100 text-orange-700" },
  CORE:        { label: "Core",        color: "bg-yellow-100 text-yellow-700" },
  CARDIO:      { label: "Cardio",      color: "bg-green-100 text-green-700" },
  FULL_BODY:   { label: "Full Body",   color: "bg-indigo-100 text-indigo-700" },
  FLEXIBILITY: { label: "Flexibility", color: "bg-teal-100 text-teal-700" },
  OTHER:       { label: "Other",       color: "bg-gray-100 text-gray-700" },
};

const ASSIGNMENT_CONFIG: Record<AssignmentStatus, { label: string; color: string }> = {
  ACTIVE:    { label: "Active",    color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-700" },
  PAUSED:    { label: "Paused",    color: "bg-yellow-100 text-yellow-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const LOG_CONFIG: Record<WorkoutLogStatus, { label: string; color: string }> = {
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
  SKIPPED:   { label: "Skipped",   color: "bg-gray-100 text-gray-600" },
  PARTIAL:   { label: "Partial",   color: "bg-yellow-100 text-yellow-700" },
};

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

export function GoalBadge({ goal }: { goal: WorkoutGoal }) {
  const cfg = GOAL_CONFIG[goal] ?? { label: goal, color: "bg-gray-100 text-gray-700" };
  return <Badge label={cfg.label} color={cfg.color} />;
}

export function LevelBadge({ level }: { level: WorkoutLevel }) {
  const cfg = LEVEL_CONFIG[level] ?? { label: level, color: "bg-gray-100 text-gray-700" };
  return <Badge label={cfg.label} color={cfg.color} />;
}

export function CategoryBadge({ category }: { category: ExerciseCategory }) {
  const cfg = CAT_CONFIG[category] ?? { label: category, color: "bg-gray-100 text-gray-700" };
  return <Badge label={cfg.label} color={cfg.color} />;
}

export function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const cfg = ASSIGNMENT_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-700" };
  return <Badge label={cfg.label} color={cfg.color} />;
}

export function LogStatusBadge({ status }: { status: WorkoutLogStatus }) {
  const cfg = LOG_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-700" };
  return <Badge label={cfg.label} color={cfg.color} />;
}
