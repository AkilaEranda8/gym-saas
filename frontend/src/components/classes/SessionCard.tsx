"use client";
import { Clock, MapPin, Users } from "lucide-react";
import { ClassSessionDTO } from "@/hooks/useClasses";
import FillRateBar from "./FillRateBar";

interface Props {
  session: ClassSessionDTO;
  onClick?: () => void;
  onBook?: () => void;
  bookLoading?: boolean;
}

export default function SessionCard({ session, onClick, onBook, bookLoading }: Props) {
  const color = session.classColor || "#64748b";

  const bookBtn = () => {
    if (session.isUserBooked) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400">✓ Booked</span>;
    }
    if (session.status === "CANCELLED") {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1e293b] text-[#475569]">Cancelled</span>;
    }
    if (session.isFull) {
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onBook?.(); }}
          className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
        >
          Join Waitlist {session.waitlistCount > 0 && `(${session.waitlistCount})`}
        </button>
      );
    }
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onBook?.(); }}
        disabled={bookLoading}
        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30 disabled:opacity-50 transition-colors"
      >
        {bookLoading ? "..." : "Book"}
      </button>
    );
  };

  return (
    <div
      className="bg-[#111827] rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 border border-[#1e293b] hover:border-[#1e293b]/80"
      style={{ borderLeft: `3px solid ${color}` }}
      onClick={onClick}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-[#e2e8f0] truncate">{session.className}</p>
            {session.trainerName && (
              <p className="text-xs text-[#475569] truncate">{session.trainerName}</p>
            )}
          </div>
          {bookBtn()}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#475569]">
          <span className="flex items-center gap-1 text-[#f59e0b] font-semibold">
            <Clock className="w-3 h-3" />
            {session.startTime}
          </span>
          {session.room && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {session.room}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {session.durationMinutes}m
          </span>
        </div>

        <FillRateBar booked={session.bookedCount} capacity={session.actualCapacity} />
      </div>
    </div>
  );
}
