"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Search } from "lucide-react";
import { WorkoutPlan, useAssignWorkout } from "@/hooks/useWorkouts";
import api from "@/lib/axios";

interface Member { id: string; fullName: string; email?: string; }

interface Props {
  plan: WorkoutPlan;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignWorkoutModal({ plan, onClose, onSuccess }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const { assign, loading } = useAssignWorkout();

  useEffect(() => {
    api.get("/members", { params: { page: 0, size: 100 } })
      .then(r => setMembers(r.data.data?.content ?? r.data.data ?? []))
      .catch(() => {});
  }, []);

  const filtered = members.filter(m =>
    m.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selected) { setError("Please select a member"); return; }
    try {
      await assign({
        memberId: selected.id,
        planId: plan.id,
        startDate,
        endDate: endDate || undefined,
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to assign workout");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assign Workout Plan</h2>
            <p className="text-sm text-gray-500 mt-0.5">{plan.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Member</label>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y">
              {filtered.slice(0, 20).map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selected?.id === m.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50"
                  }`}
                >
                  {m.fullName}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">No members found</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional notes..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Assign Plan
          </button>
        </div>
      </div>
    </div>
  );
}
