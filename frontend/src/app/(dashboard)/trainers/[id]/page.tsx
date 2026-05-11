"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import TrainerStatusBadge from "@/components/trainers/TrainerStatusBadge";
import EmploymentBadge from "@/components/trainers/EmploymentBadge";
import SpecialtyBadge from "@/components/trainers/SpecialtyBadge";
import StarRating from "@/components/trainers/StarRating";
import CertificationList from "@/components/trainers/CertificationList";
import AvailabilityGrid from "@/components/trainers/AvailabilityGrid";
import ReviewList from "@/components/trainers/ReviewList";
import {
  useTrainer, useUpdateTrainer, useDeleteTrainer,
  useTrainerAssignments, usePTSessions,
} from "@/hooks/useTrainers";
import {
  ArrowLeft, Users, Calendar, Clock, Star, Award, Loader2,
  Mail, Phone, Briefcase, Edit2, Trash2, ChevronRight,
} from "lucide-react";

type Tab = "overview" | "schedule" | "assignments" | "sessions" | "reviews" | "certifications";

export default function TrainerDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const id        = params.id as string;
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState(false);

  const { data: trainer, loading, error } = useTrainer(id);
  const { data: assignments }             = useTrainerAssignments({ trainerId: id, status: "ACTIVE" });
  const { data: sessions }                = usePTSessions({ trainerId: id, size: 10 });
  const { remove }                        = useDeleteTrainer();

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  if (error || !trainer) return (
    <div className="min-h-screen bg-zinc-950 text-red-400 flex items-center justify-center">
      {error ?? "Trainer not found"}
    </div>
  );

  const initials = trainer.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview",       label: "Overview",        icon: Briefcase },
    { key: "assignments",    label: "Clients",          icon: Users },
    { key: "sessions",       label: "Sessions",         icon: Calendar },
    { key: "certifications", label: "Certifications",   icon: Award },
    { key: "reviews",        label: "Reviews",          icon: Star },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header title="Trainer Profile" />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Profile header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="relative shrink-0">
              {trainer.photoUrl ? (
                <img src={trainer.photoUrl} alt={trainer.name}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-indigo-600/40" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              {trainer.isOnLeaveToday && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  On Leave
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-white">{trainer.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <TrainerStatusBadge status={trainer.status} />
                    <EmploymentBadge type={trainer.employmentType} />
                    {trainer.primarySpecialty && (
                      <SpecialtyBadge specialty={trainer.primarySpecialty} />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-400">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {trainer.email}</span>
                {trainer.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {trainer.phone}</span>}
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {trainer.experienceYears}y experience</span>
              </div>

              {trainer.bio && (
                <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{trainer.bio}</p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <StarRating rating={parseFloat(trainer.rating)} size="md" />
                <span className="text-white font-semibold">{trainer.rating}</span>
                <span className="text-zinc-500 text-sm">({trainer.totalReviews} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 pt-5 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Active Clients", value: trainer.activeClientsCount, color: "#818cf8" },
              { label: "Specialties",    value: trainer.specialties.length,  color: "#34d399" },
              { label: "Certifications", value: trainer.certifications.length, color: "#facc15" },
              { label: "Sessions (30d)", value: trainer.recentSessions.length, color: "#fb923c" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Weekly Availability</h3>
              <AvailabilityGrid availability={trainer.availability} />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {trainer.specialties.map(s => (
                  <SpecialtyBadge key={s} specialty={s} />
                ))}
              </div>
              {trainer.monthlyStats && (
                <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-3">
                  {[
                    { label: "Completed", value: trainer.monthlyStats.completedSessions, color: "#22c55e" },
                    { label: "Cancelled", value: trainer.monthlyStats.cancelledSessions, color: "#f87171" },
                    { label: "No Show",   value: trainer.monthlyStats.noShowSessions,    color: "#fb923c" },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-zinc-500 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "certifications" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Certifications</h3>
            <CertificationList certs={trainer.certifications} />
          </div>
        )}

        {tab === "reviews" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Member Reviews</h3>
            <ReviewList reviews={trainer.recentReviews} />
          </div>
        )}

        {tab === "assignments" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800">
              <h3 className="text-white font-semibold">Active Client Assignments</h3>
            </div>
            {(assignments?.content ?? []).length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-10">No active assignments</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {(assignments?.content ?? []).map(a => (
                  <div key={a.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{a.memberName}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {a.assignmentType.replace(/_/g, " ")} · Started {a.startedDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${a.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 text-xs">
                          {a.sessionsUsed}/{a.sessionsTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "sessions" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800">
              <h3 className="text-white font-semibold">Recent PT Sessions</h3>
            </div>
            {(sessions?.content ?? []).length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-10">No sessions found</p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {(sessions?.content ?? []).map(s => {
                  const statusColor: Record<string, string> = {
                    SCHEDULED: "#818cf8", COMPLETED: "#22c55e",
                    CANCELLED: "#f87171", NO_SHOW: "#fb923c",
                  };
                  return (
                    <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{s.memberName}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {s.sessionDate} · {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
                          · {s.durationMinutes} min
                        </p>
                      </div>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color: statusColor[s.status],
                          background: (statusColor[s.status] ?? "#6b7280") + "22",
                        }}
                      >
                        {s.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
