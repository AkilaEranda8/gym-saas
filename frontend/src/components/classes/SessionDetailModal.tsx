"use client";
import { X, User, CalendarDays, Clock, MapPin, Users, Dumbbell } from "lucide-react";
import { ClassSessionDTO, useSessionBookings, useBookClass, useCancelBooking } from "@/hooks/useClasses";
import FillRateBar from "./FillRateBar";
import BookingListTable from "./BookingListTable";
import ClassTypeBadge from "./ClassTypeBadge";
import DifficultyBadge from "./DifficultyBadge";
import { useState } from "react";

interface Props {
  session:   ClassSessionDTO;
  isAdmin:   boolean;
  onClose:   () => void;
  onBooked:  () => void;
}

export default function SessionDetailModal({ session, isAdmin, onClose, onBooked }: Props) {
  const { data: bookings, loading: bLoading, refetch } = useSessionBookings(isAdmin ? session.id : null);
  const { mutate: book,   loading: booking }            = useBookClass();
  const { mutate: cancel, loading: cancelling }         = useCancelBooking();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBook = async () => {
    try {
      await book(session.id);
      showToast("🎉 Class booked successfully!");
      onBooked();
    } catch (e: any) {
      showToast(e?.response?.data?.message || "Booking failed");
    }
  };

  const handleCancel = async () => {
    if (!session.isUserBooked) return;
    try {
      await cancel(session.id, "Cancelled by member");
      showToast("Booking cancelled");
      onBooked();
    } catch (e: any) {
      showToast(e?.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#1e293b] flex items-start justify-between"
             style={{ borderTop: `4px solid ${session.classColor}` }}>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#e2e8f0]">{session.className}</h2>
            <div className="flex flex-wrap gap-2">
              <ClassTypeBadge type={session.classType} size="sm" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                session.status === "SCHEDULED"    ? "bg-blue-500/20 text-blue-400" :
                session.status === "IN_PROGRESS"  ? "bg-emerald-500/20 text-emerald-400" :
                session.status === "COMPLETED"    ? "bg-[#1e293b] text-[#475569]" :
                "bg-red-500/20 text-red-400"
              }`}>{session.status}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#1e293b] rounded-lg text-[#475569] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Toast */}
          {toast && (
            <div className="bg-[#1e293b] border border-[#f59e0b]/30 rounded-lg p-3 text-sm text-[#e2e8f0]">
              {toast}
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: User,        label: "Trainer",   value: session.trainerName || "TBA" },
              { icon: CalendarDays,label: "Date",      value: new Date(session.sessionDate).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" }) },
              { icon: Clock,       label: "Time",      value: `${session.startTime} – ${session.endTime}` },
              { icon: MapPin,      label: "Room",      value: session.room || "TBA" },
              { icon: Dumbbell,    label: "Duration",  value: `${session.durationMinutes} min` },
              { icon: Users,       label: "Capacity",  value: `${session.bookedCount}/${session.actualCapacity}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#f59e0b]" />
                </div>
                <div>
                  <p className="text-xs text-[#475569]">{label}</p>
                  <p className="text-sm font-medium text-[#e2e8f0]">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Fill rate */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#e2e8f0]">Capacity</p>
            <FillRateBar booked={session.bookedCount} capacity={session.actualCapacity} />
          </div>

          {/* Book/Cancel */}
          {session.status === "SCHEDULED" && (
            <div className="flex gap-3">
              {session.isUserBooked ? (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-50 font-medium transition-colors"
                >
                  {cancelling ? "Cancelling..." : "Cancel Booking"}
                </button>
              ) : (
                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="flex-1 py-2.5 rounded-xl bg-[#f59e0b] text-black font-bold hover:bg-[#f59e0b]/90 disabled:opacity-50 transition-colors"
                >
                  {booking ? "Booking..." : session.isFull ? "Join Waitlist" : "Book Class"}
                </button>
              )}
            </div>
          )}

          {/* Admin: bookings list */}
          {isAdmin && (
            <div className="space-y-3">
              <h3 className="font-semibold text-[#e2e8f0]">
                Bookings {bookings && `(${bookings.length})`}
              </h3>
              {bLoading ? (
                <div className="h-20 bg-[#111827] animate-pulse rounded-lg" />
              ) : (
                <BookingListTable bookings={bookings ?? []} onRefresh={refetch} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
