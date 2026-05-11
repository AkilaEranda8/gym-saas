"use client";
import { useState, useCallback } from "react";
import { Plus, LayoutGrid, Calendar as CalIcon, Filter } from "lucide-react";
import Header from "@/components/Header";
import {
  useClasses, useClassStats, useWeekSchedule,
  ClassType, ClassSessionDTO,
} from "@/hooks/useClasses";
import ClassStatsCards    from "@/components/classes/ClassStatsCards";
import WeekCalendar       from "@/components/classes/WeekCalendar";
import ClassCard          from "@/components/classes/ClassCard";
import ClassTypeBadge     from "@/components/classes/ClassTypeBadge";
import SessionDetailModal from "@/components/classes/SessionDetailModal";
import AddClassModal      from "@/components/classes/AddClassModal";
import AddSessionModal    from "@/components/classes/AddSessionModal";

const CLASS_TYPES: ClassType[] = [
  "YOGA","HIIT","ZUMBA","PILATES","BOXING","SPINNING",
  "STRENGTH","MEDITATION","DANCE","CARDIO","CROSSFIT","OTHER",
];

function getMondayOf(d: Date) {
  const day  = d.getDay() || 7;
  const diff = d.getDate() - day + 1;
  return new Date(d.setDate(diff));
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ClassesPage() {
  const [view, setView]                   = useState<"schedule" | "list">("schedule");
  const [typeFilter, setTypeFilter]       = useState<ClassType | "">("");
  const [page, setPage]                   = useState(0);
  const [weekStart, setWeekStart]         = useState<Date>(getMondayOf(new Date()));
  const [selectedSession, setSession]     = useState<ClassSessionDTO | null>(null);
  const [showAddClass, setShowAddClass]   = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [bookLoading, setBookLoading]     = useState<string | null>(null);

  const { data: stats, loading: statsLoading }         = useClassStats();
  const { data: weekData, loading: weekLoading, refetch: refetchWeek } = useWeekSchedule(toISODate(weekStart));
  const { data: classes, loading: classesLoading, refetch: refetchClasses } = useClasses({
    page, size: 12, type: typeFilter || undefined,
  });

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };

  const handleBooked = useCallback(() => { refetchWeek(); setSession(null); }, [refetchWeek]);

  return (
    <div className="flex flex-col min-h-screen bg-[#080d16]">
      <Header title="Fitness Classes" />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <ClassStatsCards stats={stats} loading={statsLoading} />

        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* View tabs */}
          <div className="flex items-center gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1">
            <button
              onClick={() => setView("schedule")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "schedule"
                  ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                  : "text-[#475569] hover:text-[#e2e8f0]"
              }`}
            >
              <CalIcon className="w-4 h-4" /> Schedule
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                  : "text-[#475569] hover:text-[#e2e8f0]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Classes
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {view === "schedule" && (
              <button
                onClick={() => setShowAddSession(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1e293b] text-[#e2e8f0] hover:border-[#f59e0b]/40 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Session
              </button>
            )}
            <button
              onClick={() => setShowAddClass(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f59e0b] text-black font-bold text-sm hover:bg-[#f59e0b]/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Class
            </button>
          </div>
        </div>

        {/* Schedule View */}
        {view === "schedule" && (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
            <WeekCalendar
              data={weekData}
              loading={weekLoading}
              weekStart={weekStart}
              onPrevWeek={prevWeek}
              onNextWeek={nextWeek}
              onSession={setSession}
              onBook={(s) => setSession(s)}
              bookLoading={bookLoading}
            />
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="space-y-5">
            {/* Type filter pills */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTypeFilter("")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  typeFilter === ""
                    ? "bg-[#f59e0b]/20 border-[#f59e0b]/60 text-[#f59e0b]"
                    : "bg-[#111827] border-[#1e293b] text-[#475569] hover:border-[#f59e0b]/30"
                }`}
              >
                All
              </button>
              {CLASS_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`transition-colors ${typeFilter === t ? "" : ""}`}
                >
                  <ClassTypeBadge type={t} size="sm" />
                </button>
              ))}
            </div>

            {/* Class grid */}
            {classesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 bg-[#111827] animate-pulse rounded-xl border border-[#1e293b]" />
                ))}
              </div>
            ) : classes?.content.length === 0 ? (
              <div className="py-20 text-center text-[#475569]">
                <p className="text-lg font-medium">No classes found</p>
                <p className="text-sm mt-1">Create your first class to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes?.content.map((fc) => <ClassCard key={fc.id} fc={fc} />)}
              </div>
            )}

            {/* Pagination */}
            {classes && classes.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg border border-[#1e293b] text-[#e2e8f0] text-sm disabled:opacity-40 hover:border-[#f59e0b]/40 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-[#475569]">
                  Page {page + 1} of {classes.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(classes.totalPages - 1, p + 1))}
                  disabled={page >= classes.totalPages - 1}
                  className="px-4 py-2 rounded-lg border border-[#1e293b] text-[#e2e8f0] text-sm disabled:opacity-40 hover:border-[#f59e0b]/40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          isAdmin={true}
          onClose={() => setSession(null)}
          onBooked={handleBooked}
        />
      )}
      {showAddClass && (
        <AddClassModal
          onClose={() => setShowAddClass(false)}
          onCreated={() => { setShowAddClass(false); refetchClasses(); refetchWeek(); }}
        />
      )}
      {showAddSession && (
        <AddSessionModal
          onClose={() => setShowAddSession(false)}
          onCreated={() => { setShowAddSession(false); refetchWeek(); }}
        />
      )}
    </div>
  );
}
