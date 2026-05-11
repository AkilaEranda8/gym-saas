"use client";
import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Users, MapPin, Repeat, Edit, Trash2, Plus, Calendar, TrendingUp } from "lucide-react";
import {
  useClass, useWeekSchedule, useBookClass, useDeleteClass,
  ClassSessionDTO, ClassType,
} from "@/hooks/useClasses";
import ClassTypeBadge    from "@/components/classes/ClassTypeBadge";
import DifficultyBadge   from "@/components/classes/DifficultyBadge";
import SessionDetailModal from "@/components/classes/SessionDetailModal";
import SessionCard        from "@/components/classes/SessionCard";
import FillRateBar        from "@/components/classes/FillRateBar";

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function getMondayOf(d: Date) {
  const day = d.getDay() || 7;
  return new Date(d.setDate(d.getDate() - day + 1));
}

export default function ClassDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const { data: fc, loading, error } = useClass(id);
  const [weekStart]                  = useState<Date>(getMondayOf(new Date()));
  const { data: weekData, refetch: refetchWeek } = useWeekSchedule(
    weekStart.toISOString().slice(0, 10)
  );
  const { mutate: bookClass, loading: booking } = useBookClass();
  const { mutate: deleteClass }                 = useDeleteClass();

  const [selectedSession, setSession] = useState<ClassSessionDTO | null>(null);
  const [showDelete, setShowDelete]   = useState(false);

  const classSessions = weekData
    ? Object.values(weekData.days).flat().filter((s) => s.classId === id)
    : fc?.upcomingSessions ?? [];

  const handleBooked = useCallback(() => {
    refetchWeek();
    setSession(null);
  }, [refetchWeek]);

  const handleDelete = async () => {
    try {
      await deleteClass(id);
      router.push("/classes");
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d16] p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 w-40 bg-[#111827] animate-pulse rounded" />
          <div className="h-48 bg-[#111827] animate-pulse rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-[#111827] animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !fc) {
    return (
      <div className="min-h-screen bg-[#080d16] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{error || "Class not found"}</p>
          <button
            onClick={() => router.push("/classes")}
            className="px-4 py-2 rounded-xl border border-[#1e293b] text-[#e2e8f0] hover:border-[#f59e0b]/40 transition-colors"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d16]">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-[#080d16]/90 backdrop-blur border-b border-[#1e293b] px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/classes")}
          className="flex items-center gap-2 text-[#475569] hover:text-[#e2e8f0] text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Classes
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDelete(true)}
            className="p-2 rounded-lg border border-[#1e293b] text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Hero */}
        <div
          className="rounded-2xl overflow-hidden border border-[#1e293b]"
          style={{ borderTop: `4px solid ${fc.color || "#64748b"}` }}
        >
          <div className="bg-[#0f172a] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-[#e2e8f0]">{fc.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <ClassTypeBadge type={fc.type} />
                  <DifficultyBadge difficulty={fc.difficulty} />
                  {fc.isRecurring && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
                      <Repeat className="w-3.5 h-3.5" /> Recurring
                    </span>
                  )}
                </div>
                {fc.description && (
                  <p className="text-[#475569] max-w-lg">{fc.description}</p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { icon: Clock,       label: "Duration",  value: `${fc.durationMinutes} min` },
                { icon: Users,       label: "Capacity",  value: `${fc.capacity} max` },
                { icon: MapPin,      label: "Room",      value: fc.room || "TBA" },
                { icon: Calendar,    label: "Schedules", value: `${fc.activeSchedules}/wk` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-[#111827] rounded-xl p-4 border border-[#1e293b] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#475569]">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <p className="font-semibold text-[#e2e8f0]">{value}</p>
                </div>
              ))}
            </div>

            {/* Trainer */}
            {fc.trainerName && (
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] font-bold text-lg">
                  {fc.trainerName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-[#475569]">Trainer</p>
                  <p className="font-semibold text-[#e2e8f0]">{fc.trainerName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: upcoming sessions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#e2e8f0]">Upcoming Sessions</h2>
            </div>
            {classSessions.length === 0 ? (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-8 text-center text-[#475569]">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No upcoming sessions this week</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classSessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onClick={() => setSession(s)}
                    onBook={() => setSession(s)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: schedules */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#e2e8f0]">Weekly Schedules</h2>
            {fc.schedules.length === 0 ? (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 text-center text-[#475569] text-sm">
                No schedules configured
              </div>
            ) : (
              <div className="space-y-2">
                {fc.schedules.map((s) => (
                  <div key={s.id} className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: fc.color || "#64748b" }}
                      >
                        {DAYS[(s.dayOfWeek - 1) % 7]}
                      </span>
                      {s.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[#e2e8f0] font-medium text-sm">
                      {s.startTime} – {s.endTime}
                    </p>
                    <p className="text-xs text-[#475569]">{s.maxCapacity} max</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          isAdmin={true}
          onClose={() => setSession(null)}
          onBooked={handleBooked}
        />
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#e2e8f0]">Delete Class?</h3>
            <p className="text-[#475569] text-sm">
              <strong className="text-red-400">{fc.name}</strong> and all future sessions will be soft-deleted.
              Existing members will be notified.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#1e293b] text-[#475569] hover:text-[#e2e8f0] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors font-bold"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
