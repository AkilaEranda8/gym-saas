"use client";
import { ClassDifficulty } from "@/hooks/useClasses";

const STYLES: Record<ClassDifficulty, string> = {
  BEGINNER:     "bg-emerald-500/20 text-emerald-400",
  INTERMEDIATE: "bg-amber-500/20 text-amber-400",
  ADVANCED:     "bg-red-500/20 text-red-400",
  ALL_LEVELS:   "bg-blue-500/20 text-blue-400",
};

const LABELS: Record<ClassDifficulty, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced", ALL_LEVELS: "All Levels",
};

export default function DifficultyBadge({ difficulty }: { difficulty: ClassDifficulty }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STYLES[difficulty]}`}>
      {LABELS[difficulty]}
    </span>
  );
}
