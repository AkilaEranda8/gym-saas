"use client";
import { CheckCircle, XCircle } from "lucide-react";
import { ClassBookingDTO, BookingStatus, useMarkAttended } from "@/hooks/useClasses";
import { useState } from "react";

const STATUS_STYLES: Record<BookingStatus, string> = {
  BOOKED:     "bg-blue-500/20 text-blue-400",
  ATTENDED:   "bg-emerald-500/20 text-emerald-400",
  CANCELLED:  "bg-[#1e293b] text-[#475569]",
  NO_SHOW:    "bg-red-500/20 text-red-400",
  WAITLISTED: "bg-amber-500/20 text-amber-400",
};

interface Props {
  bookings:  ClassBookingDTO[];
  onRefresh: () => void;
}

export default function BookingListTable({ bookings, onRefresh }: Props) {
  const { mutate: markAttended } = useMarkAttended();
  const [actioning, setActioning] = useState<string | null>(null);

  const handleAttended = async (id: string) => {
    setActioning(id);
    try { await markAttended(id); onRefresh(); }
    finally { setActioning(null); }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e293b]">
            <th className="text-left py-2 px-3 text-[#475569] font-medium">Member</th>
            <th className="text-left py-2 px-3 text-[#475569] font-medium">Status</th>
            <th className="text-left py-2 px-3 text-[#475569] font-medium">Booked At</th>
            <th className="text-right py-2 px-3 text-[#475569] font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30">
              <td className="py-2.5 px-3">
                <div>
                  <p className="font-medium text-[#e2e8f0]">{b.memberName ?? "—"}</p>
                  {b.memberPhone && <p className="text-xs text-[#475569]">{b.memberPhone}</p>}
                </div>
              </td>
              <td className="py-2.5 px-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </td>
              <td className="py-2.5 px-3 text-[#475569]">
                {new Date(b.bookedAt).toLocaleDateString()}
              </td>
              <td className="py-2.5 px-3 text-right">
                {b.status === "BOOKED" && (
                  <button
                    onClick={() => handleAttended(b.id)}
                    disabled={actioning === b.id}
                    className="p-1.5 rounded text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
                    title="Mark Attended"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-[#475569]">No bookings</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
