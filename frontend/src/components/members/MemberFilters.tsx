"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

interface Props {
  onSearch:   (v: string) => void;
  onStatus:   (v: string) => void;
  status:     string;
}

const STATUSES = ["", "ACTIVE", "EXPIRING", "EXPIRED", "SUSPENDED"];

export default function MemberFilters({ onSearch, onStatus, status }: Props) {
  const [raw, setRaw] = useState("");

  useEffect(() => {
    const t = setTimeout(() => onSearch(raw), 300);
    return () => clearTimeout(t);
  }, [raw, onSearch]);

  const active = (raw !== "" ? 1 : 0) + (status ? 1 : 0);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
        <input
          className="w-full bg-[#111827] border border-[#1e293b] rounded-lg pl-9 pr-9 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b] transition-colors"
          placeholder="Search name, email, phone…"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        {raw && (
          <button onClick={() => setRaw("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#e2e8f0]">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        className="bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] transition-colors"
      >
        <option value="">All Statuses</option>
        {STATUSES.filter(Boolean).map((s) => (
          <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
        ))}
      </select>

      {active > 0 && (
        <button
          onClick={() => { setRaw(""); onSearch(""); onStatus(""); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#f87171] border border-[#f87171]/30 hover:bg-[#f87171]/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear ({active})
        </button>
      )}
    </div>
  );
}
