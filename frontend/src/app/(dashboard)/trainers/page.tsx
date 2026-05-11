"use client";
import { useState } from "react";
import Header from "@/components/Header";
import TrainerStatsCards from "@/components/trainers/TrainerStatsCards";
import TrainerCard from "@/components/trainers/TrainerCard";
import TrainerTable from "@/components/trainers/TrainerTable";
import AddTrainerModal from "@/components/trainers/AddTrainerModal";
import { useTrainers, useDeleteTrainer, type TrainerStatus } from "@/hooks/useTrainers";
import {
  Plus, LayoutGrid, List, Search, ChevronLeft, ChevronRight,
  Loader2, Trash2, SlidersHorizontal, Users,
} from "lucide-react";

export default function TrainersPage() {
  const [view,          setView]          = useState<"grid" | "table">("grid");
  const [showAdd,       setShowAdd]       = useState(false);
  const [search,        setSearch]        = useState("");
  const [status,        setStatus]        = useState<TrainerStatus | undefined>();
  const [page,          setPage]          = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const { data, loading, error, refetch } = useTrainers({ page, size: 12, status });
  const { remove } = useDeleteTrainer();

  const trainers = data?.content ?? [];
  const filtered = search.trim()
    ? trainers.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()))
    : trainers;

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const ok = await remove(deleteConfirm.id);
    if (ok) { refetch(); }
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[#080d16]">
      <Header title="Trainers" subtitle="Manage your gym's trainer team" />

      <div className="p-6 space-y-5">

        {/* ── Stats ─────────────────────────────────── */}
        <TrainerStatsCards />

        {/* ── Toolbar ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">

          {/* Left: search + filter */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
              <input
                className="w-full bg-[#111827] border border-[#1e293b] rounded-xl pl-9 pr-3 py-2.5 text-[#e2e8f0] text-sm placeholder-[#334155] focus:outline-none focus:border-blue-500/60 transition-colors"
                placeholder="Search by name or email…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569] pointer-events-none" />
              <select
                className="bg-[#111827] border border-[#1e293b] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[#e2e8f0] focus:outline-none focus:border-blue-500/60 transition-colors appearance-none cursor-pointer"
                value={status ?? ""}
                onChange={e => { setStatus(e.target.value as TrainerStatus || undefined); setPage(0); }}
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          </div>

          {/* Right: view toggle + count + add */}
          <div className="flex items-center gap-2">
            {data && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#111827] border border-[#1e293b] rounded-xl text-xs text-[#475569]">
                <Users className="w-3.5 h-3.5" />
                {data.totalElements} trainers
              </span>
            )}
            <div className="flex items-center bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-2.5 transition-colors ${
                  view === "grid"
                    ? "bg-[#1e293b] text-[#e2e8f0]"
                    : "text-[#475569] hover:text-[#94a3b8]"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("table")}
                className={`px-3 py-2.5 transition-colors ${
                  view === "table"
                    ? "bg-[#1e293b] text-[#e2e8f0]"
                    : "text-[#475569] hover:text-[#94a3b8]"
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              Add Trainer
            </button>
          </div>
        </div>

        {/* ── Content ───────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-[#475569] text-sm">Loading trainers…</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1e293b] flex items-center justify-center">
              <Users className="w-7 h-7 text-[#334155]" />
            </div>
            <div className="text-center">
              <p className="text-[#94a3b8] font-medium">No trainers found</p>
              <p className="text-[#475569] text-sm mt-1">
                {search ? "Try a different search term" : "Add your first trainer to get started"}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Trainer
              </button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map(t => <TrainerCard key={t.id} trainer={t} />)}
          </div>
        ) : (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden">
            <TrainerTable
              trainers={filtered}
              onDelete={(id, name) => setDeleteConfirm({ id, name })}
            />
          </div>
        )}

        {/* ── Pagination ────────────────────────────── */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[#475569] text-xs">
              Showing {page * 12 + 1}–{Math.min((page + 1) * 12, data.totalElements)} of {data.totalElements} trainers
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-[#1e293b] text-[#475569] hover:text-[#e2e8f0] hover:border-[#334155] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-xs text-[#475569]">
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                disabled={page >= data.totalPages - 1}
                className="p-1.5 rounded-lg border border-[#1e293b] text-[#475569] hover:text-[#e2e8f0] hover:border-[#334155] disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────── */}
      {showAdd && (
        <AddTrainerModal onClose={() => setShowAdd(false)} onCreated={refetch} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-[#e2e8f0] font-semibold">Remove Trainer</h3>
                <p className="text-[#475569] text-xs mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[#94a3b8] text-sm mb-5">
              Remove <span className="text-[#e2e8f0] font-semibold">{deleteConfirm.name}</span>?
              Trainers with active assignments cannot be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#1e293b] text-[#94a3b8] text-sm hover:bg-[#1e293b] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
