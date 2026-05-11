"use client";
import Link from "next/link";
import { type TrainerDTO, type TrainerSpecialty } from "@/hooks/useTrainers";
import TrainerStatusBadge from "./TrainerStatusBadge";
import EmploymentBadge from "./EmploymentBadge";
import SpecialtyBadge from "./SpecialtyBadge";
import { Star, Users, CalendarDays, Dumbbell, ArrowRight } from "lucide-react";

const GRADIENTS = [
  "from-violet-600 to-indigo-600",
  "from-blue-600 to-cyan-500",
  "from-pink-600 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-600 to-teal-500",
  "from-fuchsia-600 to-purple-600",
];

export default function TrainerCard({ trainer }: { trainer: TrainerDTO }) {
  const initials = trainer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const gradient = GRADIENTS[trainer.id.charCodeAt(0) % GRADIENTS.length];

  return (
    <Link href={`/trainers/${trainer.id}`}>
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl overflow-hidden hover:border-[#334155] hover:shadow-lg hover:shadow-black/30 transition-all group cursor-pointer flex flex-col">

        {/* Gradient header banner */}
        <div className={`h-[72px] bg-gradient-to-r ${gradient} relative flex-shrink-0`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-3 right-3">
            <TrainerStatusBadge status={trainer.status} />
          </div>
        </div>

        <div className="px-5 pb-5 flex flex-col flex-1">
          {/* Avatar + rating row */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="relative">
              {trainer.photoUrl ? (
                <img src={trainer.photoUrl} alt={trainer.name}
                  className="w-16 h-16 rounded-2xl object-cover border-[3px] border-[#111827]" />
              ) : (
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl border-[3px] border-[#111827]`}>
                  {initials}
                </div>
              )}
              {trainer.status === "ACTIVE" && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111827]" />
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-[#1e293b] rounded-xl px-3 py-1.5 mb-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[#e2e8f0] font-bold text-sm">{trainer.rating}</span>
              <span className="text-[#475569] text-xs">({trainer.totalReviews})</span>
            </div>
          </div>

          {/* Name + badges */}
          <h3 className="text-[#e2e8f0] font-semibold text-[15px] mb-1.5 group-hover:text-blue-400 transition-colors truncate">
            {trainer.name}
          </h3>
          <p className="text-[#475569] text-xs mb-3 truncate">{trainer.email}</p>

          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            <EmploymentBadge type={trainer.employmentType} />
            {trainer.primarySpecialty && (
              <SpecialtyBadge specialty={trainer.primarySpecialty} showEmoji={false} />
            )}
          </div>

          {/* 3-stat mini grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: Users,        label: "Clients",  value: trainer.activeClientsCount },
              { icon: CalendarDays, label: "Classes",  value: trainer.classesThisWeek },
              { icon: Dumbbell,     label: "Exp.",     value: `${trainer.experienceYears}y` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-[#0d1117] rounded-xl p-2.5 text-center border border-[#1e293b]/50">
                <Icon className="w-3.5 h-3.5 text-[#475569] mx-auto mb-1" />
                <p className="text-[#e2e8f0] font-bold text-sm leading-none">{value}</p>
                <p className="text-[#475569] text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Specialty tags */}
          <div className="flex flex-wrap gap-1 flex-1">
            {trainer.specialties.slice(0, 3).map(s => (
              <SpecialtyBadge key={s} specialty={s as TrainerSpecialty} showEmoji={false} />
            ))}
            {trainer.specialties.length > 3 && (
              <span className="text-[#475569] text-xs self-center">
                +{trainer.specialties.length - 3} more
              </span>
            )}
          </div>

          {/* View profile footer */}
          <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between">
            <span className="text-xs text-[#475569]">
              Joined {new Date(trainer.joinedDate).getFullYear()}
            </span>
            <span className="flex items-center gap-1 text-xs text-blue-400 font-medium group-hover:gap-2 transition-all">
              View Profile <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
