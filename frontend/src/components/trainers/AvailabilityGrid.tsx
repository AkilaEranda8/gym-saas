"use client";
import { type AvailabilityDTO } from "@/hooks/useTrainers";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AvailabilityGrid({ availability }: { availability: AvailabilityDTO[] }) {
  const byDay = Object.fromEntries(availability.map(a => [a.dayOfWeek, a]));

  return (
    <div className="grid grid-cols-7 gap-1">
      {DAYS.map((day, i) => {
        const avail = byDay[i + 1];
        const active = avail?.isAvailable;
        return (
          <div key={day} className="text-center">
            <p className="text-zinc-500 text-xs mb-1">{day}</p>
            <div
              className={`rounded-lg py-2 text-xs font-medium ${
                active
                  ? "bg-green-900/30 border border-green-700/40 text-green-400"
                  : avail
                  ? "bg-zinc-800 border border-zinc-700 text-zinc-500"
                  : "bg-zinc-800/30 border border-zinc-800 text-zinc-700"
              }`}
            >
              {active ? (
                <>
                  <div className="text-[10px]">{avail.startTime.slice(0, 5)}</div>
                  <div className="text-[10px]">{avail.endTime.slice(0, 5)}</div>
                </>
              ) : (
                <div className="py-1">—</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
