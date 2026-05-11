"use client";
import Link from "next/link";
import { type TrainerDTO } from "@/hooks/useTrainers";
import TrainerStatusBadge from "./TrainerStatusBadge";
import EmploymentBadge from "./EmploymentBadge";
import SpecialtyBadge from "./SpecialtyBadge";
import StarRating from "./StarRating";
import { Eye, Trash2, Users } from "lucide-react";

interface Props {
  trainers: TrainerDTO[];
  onDelete?: (id: string, name: string) => void;
}

export default function TrainerTable({ trainers, onDelete }: Props) {
  if (trainers.length === 0) {
    return (
      <div className="text-center py-16 text-[#475569]">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No trainers found</p>
        <p className="text-sm mt-1">Add a trainer to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e293b] text-[#475569] text-left">
            <th className="py-3 pr-4 font-medium">Trainer</th>
            <th className="py-3 pr-4 font-medium">Specialty</th>
            <th className="py-3 pr-4 font-medium">Employment</th>
            <th className="py-3 pr-4 font-medium">Rating</th>
            <th className="py-3 pr-4 font-medium">Clients</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map(t => {
            const initials = t.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <tr key={t.id} className="border-b border-[#1e293b]/60 hover:bg-[#1e293b]/40 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-[#e2e8f0] font-medium">{t.name}</p>
                      <p className="text-[#475569] text-xs">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {t.primarySpecialty
                    ? <SpecialtyBadge specialty={t.primarySpecialty} />
                    : <span className="text-[#334155]">—</span>}
                </td>
                <td className="py-3 pr-4">
                  <EmploymentBadge type={t.employmentType} />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={parseFloat(t.rating)} size="sm" />
                    <span className="text-[#475569] text-xs">{t.rating}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[#94a3b8]">
                  {t.activeClientsCount}
                </td>
                <td className="py-3 pr-4">
                  <TrainerStatusBadge status={t.status} />
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/trainers/${t.id}`}>
                      <button className="p-1.5 rounded hover:bg-[#1e293b] text-[#475569] hover:text-[#e2e8f0] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(t.id, t.name)}
                        className="p-1.5 rounded hover:bg-red-900/30 text-[#475569] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
