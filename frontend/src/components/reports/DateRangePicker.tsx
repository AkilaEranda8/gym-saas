"use client";
import React from "react";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  presets?: boolean;
}

function fmt(d: Date) { return d.toISOString().slice(0, 10); }

export default function DateRangePicker({
  from, to, onFromChange, onToChange, presets = true,
}: DateRangePickerProps) {
  const today = fmt(new Date());

  const apply = (label: string) => {
    const now = new Date();
    switch (label) {
      case "Today":
        onFromChange(today); onToChange(today); break;
      case "This Week": {
        const d = new Date(now);
        d.setDate(d.getDate() - d.getDay());
        onFromChange(fmt(d)); onToChange(today); break;
      }
      case "This Month": {
        onFromChange(fmt(new Date(now.getFullYear(), now.getMonth(), 1))); onToChange(today); break;
      }
      case "Last Month": {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end   = new Date(now.getFullYear(), now.getMonth(), 0);
        onFromChange(fmt(start)); onToChange(fmt(end)); break;
      }
      case "Last 3 Months": {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 3);
        onFromChange(fmt(d)); onToChange(today); break;
      }
      case "This Year": {
        onFromChange(fmt(new Date(now.getFullYear(), 0, 1))); onToChange(today); break;
      }
    }
  };

  const presetLabels = ["Today", "This Week", "This Month", "Last Month", "Last 3 Months", "This Year"];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets && (
        <div className="flex flex-wrap gap-1">
          {presetLabels.map(label => (
            <button
              key={label}
              onClick={() => apply(label)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-yellow-400/10 hover:text-yellow-400 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
        <Calendar className="w-4 h-4 text-gray-500" />
        <input
          type="date"
          value={from}
          max={to}
          onChange={e => onFromChange(e.target.value)}
          className="bg-transparent text-sm text-gray-300 outline-none [color-scheme:dark]"
        />
        <span className="text-gray-600">→</span>
        <input
          type="date"
          value={to}
          min={from}
          max={today}
          onChange={e => onToChange(e.target.value)}
          className="bg-transparent text-sm text-gray-300 outline-none [color-scheme:dark]"
        />
      </div>
    </div>
  );
}
