"use client";
import React, { useState } from "react";
import { X, Loader2, Search } from "lucide-react";
import { useAssignLocker, type LockerDTO } from "@/hooks/useLockers";
import { useMembers } from "@/hooks/useMembers";
import toast from "react-hot-toast";

interface Props {
  locker: LockerDTO;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignLockerModal({ locker, onClose, onAssigned }: Props) {
  const { assign, loading } = useAssignLocker();
  const [search, setSearch]     = useState("");
  const [selectedId, setSelected] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [endDate, setEndDate]   = useState("");

  const { data: memberData } = useMembers({ search, size: 20 });
  const members = memberData?.content ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) { toast.error("Please select a member"); return; }
    const result = await assign(locker.id, {
      memberId: selectedId,
      endDate: endDate || undefined,
    });
    if (result) {
      toast.success(`Locker ${locker.lockerNumber} assigned to ${selectedName}`);
      onAssigned(); onClose();
    } else {
      toast.error("Failed to assign locker");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Assign Locker</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {locker.lockerNumber} · {locker.size} · Rs. {Number(locker.monthlyRate).toLocaleString()}/mo
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Search Member *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Name or email..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {members.length > 0 && (
              <div className="mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-40 overflow-y-auto">
                {members.map(m => (
                  <button key={m.id} type="button"
                    onClick={() => { setSelected(m.id); setSelectedName(`${m.firstName} ${m.lastName}`); setSearch(`${m.firstName} ${m.lastName}`); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${selectedId === m.id ? "bg-blue-600/20 text-blue-400" : "text-gray-300"}`}>
                    <span className="font-medium">{m.firstName} {m.lastName}</span>
                    <span className="text-gray-500 ml-2 text-xs">{m.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Date (optional)</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {selectedId && (
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg px-3 py-2 text-sm text-blue-300">
              Assigning to: <span className="font-semibold">{selectedName}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-600 rounded-xl text-sm text-gray-300 hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !selectedId}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Assign Locker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
