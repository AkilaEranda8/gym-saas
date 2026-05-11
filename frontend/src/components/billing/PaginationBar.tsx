"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPage: (p: number) => void;
}

export default function PaginationBar({ page, totalPages, totalElements, size, onPage }: Props) {
  const from = page * size + 1;
  const to   = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
      <span>{from}–{to} of {totalElements}</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 0} onClick={() => onPage(page - 1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
          <button key={i} onClick={() => onPage(i)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              i === page ? "bg-emerald-600 text-white" : "hover:bg-slate-100 text-slate-600"
            }`}>
            {i + 1}
          </button>
        ))}
        <button disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
