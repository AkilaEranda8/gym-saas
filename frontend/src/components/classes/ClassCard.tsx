"use client";
import { useRouter } from "next/navigation";
import { Clock, Users, MapPin, Calendar } from "lucide-react";
import { FitnessClassDTO } from "@/hooks/useClasses";
import ClassTypeBadge from "./ClassTypeBadge";
import DifficultyBadge from "./DifficultyBadge";

export default function ClassCard({ fc }: { fc: FitnessClassDTO }) {
  const router = useRouter();

  return (
    <div
      className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden cursor-pointer hover:border-[#f59e0b]/40 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 group"
      onClick={() => router.push(`/classes/${fc.id}`)}
    >
      {/* Color accent bar */}
      <div className="h-1.5" style={{ backgroundColor: fc.color || "#64748b" }} />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <h3 className="font-semibold text-[#e2e8f0] text-lg leading-tight group-hover:text-white">
              {fc.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <ClassTypeBadge type={fc.type} size="sm" />
              <DifficultyBadge difficulty={fc.difficulty} />
            </div>
          </div>
        </div>

        {/* Description */}
        {fc.description && (
          <p className="text-sm text-[#475569] line-clamp-2">{fc.description}</p>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 text-sm text-[#475569]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{fc.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{fc.capacity} max</span>
          </div>
          {fc.room && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{fc.room}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{fc.activeSchedules} session{fc.activeSchedules !== 1 ? "s" : ""}/wk</span>
          </div>
        </div>

        {/* Trainer */}
        {fc.trainerName && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#1e293b]">
            <div className="w-6 h-6 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-xs text-[#f59e0b] font-bold">
              {fc.trainerName.charAt(0)}
            </div>
            <span className="text-sm text-[#475569]">{fc.trainerName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
