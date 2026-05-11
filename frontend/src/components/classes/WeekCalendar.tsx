"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ClassSessionDTO, WeekScheduleDTO } from "@/hooks/useClasses";
import SessionCard from "./SessionCard";

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

interface Props {
  data:         WeekScheduleDTO | null;
  loading:      boolean;
  weekStart:    Date;
  onPrevWeek:   () => void;
  onNextWeek:   () => void;
  onSession:    (s: ClassSessionDTO) => void;
  onBook:       (s: ClassSessionDTO) => void;
  bookLoading?: string | null;
}

export default function WeekCalendar({
  data, loading, weekStart, onPrevWeek, onNextWeek, onSession, onBook, bookLoading
}: Props) {
  const today      = new Date();
  const todayStr   = today.toISOString().slice(0, 10);
  const weekDates  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevWeek}
          className="p-2 rounded-lg bg-[#111827] border border-[#1e293b] hover:border-[#f59e0b]/40 text-[#e2e8f0] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[#e2e8f0] font-medium">
          {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
          {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <button
          onClick={onNextWeek}
          className="p-2 rounded-lg bg-[#111827] border border-[#1e293b] hover:border-[#f59e0b]/40 text-[#e2e8f0] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">
          {/* Day headers */}
          {DAYS.map((day, i) => {
            const date    = weekDates[i];
            const dateStr = fmtDate(date);
            const isToday = dateStr === todayStr;
            return (
              <div key={day} className="text-center space-y-1">
                <p className="text-xs text-[#475569] font-medium">{SHORT[i]}</p>
                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-semibold ${
                    isToday
                      ? "bg-[#f59e0b] text-black"
                      : "text-[#e2e8f0]"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            );
          })}

          {/* Sessions per day */}
          {DAYS.map((day) => {
            const sessions = data?.days[day] ?? [];
            return (
              <div key={day + "-col"} className="space-y-2">
                {loading ? (
                  Array.from({ length: 2 }).map((_, k) => (
                    <div key={k} className="h-20 bg-[#111827] animate-pulse rounded-lg border border-[#1e293b]" />
                  ))
                ) : sessions.length === 0 ? (
                  <div className="h-12 flex items-center justify-center text-xs text-[#475569] text-center">
                    No classes
                  </div>
                ) : (
                  sessions.map((s) => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      onClick={() => onSession(s)}
                      onBook={() => onBook(s)}
                      bookLoading={bookLoading === s.id}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
