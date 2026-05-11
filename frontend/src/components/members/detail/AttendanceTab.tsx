"use client";

import { useMemberAttendance } from "@/hooks/useMembers";
import { Clock, QrCode, Hand } from "lucide-react";

const METHOD_ICON: Record<string, React.ReactNode> = {
  QR:          <QrCode className="w-3.5 h-3.5" />,
  MANUAL:      <Hand className="w-3.5 h-3.5" />,
  FINGERPRINT: <span className="text-xs">👆</span>,
};

function fmt(d: string) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AttendanceTab({ memberId }: { memberId: string }) {
  const { attendance, isLoading } = useMemberAttendance(memberId);

  const thisMonth = attendance.filter((a) => {
    const d = new Date(a.checkInTime);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <div className="text-xs text-[#475569] mb-1">This Month</div>
          <div className="text-2xl font-bold text-[#60a5fa]">{thisMonth}</div>
          <div className="text-xs text-[#475569]">check-ins</div>
        </div>
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
          <div className="text-xs text-[#475569] mb-1">Total Records</div>
          <div className="text-2xl font-bold text-[#34d399]">{attendance.length}</div>
          <div className="text-xs text-[#475569]">loaded</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1e293b]">
          <h3 className="text-sm font-semibold text-[#e2e8f0]">Recent Check-ins</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-[#475569]">Loading attendance…</div>
        ) : attendance.length === 0 ? (
          <div className="p-8 text-center text-[#475569]">No attendance records.</div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {attendance.map((a) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0f172a] flex items-center justify-center text-[#60a5fa]">
                    {METHOD_ICON[a.checkInMethod] ?? <Clock className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="text-sm text-[#e2e8f0]">{fmt(a.checkInTime)}</div>
                    {a.checkOutTime && (
                      <div className="text-xs text-[#475569]">
                        Out: {new Date(a.checkOutTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        {a.durationMinutes != null && ` · ${a.durationMinutes} min`}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#0f172a] text-[#475569]">
                  {a.checkInMethod}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
