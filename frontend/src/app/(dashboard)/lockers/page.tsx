"use client";
import React, { useState, useMemo } from "react";
import Header from "@/components/Header";
import {
  useLockers, useLockerStats, useLockerAssignments, useReleaseLocker, useDeleteLocker,
  type LockerDTO, type LockerStatus, type AssignmentStatus,
} from "@/hooks/useLockers";
import LockerStatsCards from "@/components/lockers/LockerStatsCards";
import AddLockerModal from "@/components/lockers/AddLockerModal";
import AssignLockerModal from "@/components/lockers/AssignLockerModal";
import {
  Plus, Search, Lock, User, Calendar, Wrench, CheckCircle,
  Edit2, Trash2, LogOut, RefreshCw, Grid, List,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<LockerStatus, string> = {
  AVAILABLE:   "bg-green-500/20 text-green-400 border-green-500/30",
  OCCUPIED:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  MAINTENANCE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const STATUS_ICONS: Record<LockerStatus, React.ReactNode> = {
  AVAILABLE:   <CheckCircle className="w-3.5 h-3.5" />,
  OCCUPIED:    <User className="w-3.5 h-3.5" />,
  MAINTENANCE: <Wrench className="w-3.5 h-3.5" />,
};

type Tab = "lockers" | "assignments";

export default function LockersPage() {
  const { lockers, loading: lockersLoading, refetch: refetchLockers } = useLockers();
  const { stats, loading: statsLoading, refetch: refetchStats }       = useLockerStats();
  const [assignFilter, setAssignFilter] = useState<AssignmentStatus | "">("");
  const { assignments, loading: assignmentsLoading, refetch: refetchAssignments } =
    useLockerAssignments(assignFilter as AssignmentStatus | undefined);
  const { release, loading: releasing }     = useReleaseLocker();
  const { deleteLocker, loading: deleting } = useDeleteLocker();

  const [tab, setTab]               = useState<Tab>("lockers");
  const [viewMode, setViewMode]     = useState<"grid" | "list">("grid");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState<LockerStatus | "">("");
  const [showAdd, setShowAdd]       = useState(false);
  const [editLocker, setEditLocker] = useState<LockerDTO | null>(null);
  const [assignTarget, setAssign]   = useState<LockerDTO | null>(null);

  const refetchAll = () => { refetchLockers(); refetchStats(); refetchAssignments(); };

  const filtered = useMemo(() => {
    let list = lockers;
    if (statusFilter) list = list.filter(l => l.status === statusFilter);
    if (search) list = list.filter(l =>
      l.lockerNumber.toLowerCase().includes(search.toLowerCase()) ||
      (l.assignedTo ?? "").toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [lockers, statusFilter, search]);

  const handleRelease = async (id: string, lockerNum: string) => {
    if (!confirm(`Release assignment for locker ${lockerNum}?`)) return;
    const ok = await release(id);
    if (ok) { toast.success("Locker released"); refetchAll(); }
    else toast.error("Failed to release");
  };

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Delete locker ${num}? This cannot be undone.`)) return;
    const ok = await deleteLocker(id);
    if (ok) { toast.success("Locker deleted"); refetchAll(); }
    else toast.error("Cannot delete occupied locker");
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 min-h-screen">
      <Header title="Lockers" />

      <div className="flex-1 p-6 space-y-6">

        {/* Stats */}
        {stats && !statsLoading && <LockerStatsCards stats={stats} />}

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
            {(["lockers", "assignments"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
                {t === "lockers" ? `Lockers (${lockers.length})` : `Assignments (${assignments.length})`}
              </button>
            ))}
          </div>

          {tab === "lockers" && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Add Locker
            </button>
          )}
        </div>

        {/* ── LOCKERS TAB ─────────────────────────────────────────── */}
        {tab === "lockers" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by number or member..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={statusFilter} onChange={e => setStatus(e.target.value as LockerStatus | "")}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
              <div className="flex bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <button onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")}
                  className={`px-3 py-2 transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button onClick={refetchAll} className="p-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {lockersLoading ? (
              <div className="text-center py-16 text-gray-500">Loading lockers...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <Lock className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No lockers found</p>
                <button onClick={() => setShowAdd(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                  Add First Locker
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filtered.map(locker => (
                  <LockerCard key={locker.id} locker={locker}
                    onAssign={() => setAssign(locker)}
                    onEdit={() => setEditLocker(locker)}
                    onDelete={() => handleDelete(locker.id, locker.lockerNumber)} />
                ))}
              </div>
            ) : (
              <LockerTable lockers={filtered}
                onAssign={setAssign}
                onEdit={setEditLocker}
                onDelete={(l) => handleDelete(l.id, l.lockerNumber)} />
            )}
          </div>
        )}

        {/* ── ASSIGNMENTS TAB ──────────────────────────────────────── */}
        {tab === "assignments" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <select value={assignFilter} onChange={e => setAssignFilter(e.target.value as AssignmentStatus | "")}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Assignments</option>
                <option value="ACTIVE">Active</option>
                <option value="RELEASED">Released</option>
                <option value="EXPIRED">Expired</option>
              </select>
              <button onClick={refetchAll} className="p-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {assignmentsLoading ? (
              <div className="text-center py-16 text-gray-500">Loading assignments...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-16">
                <User className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No assignments found</p>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Locker</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Member</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Start Date</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">End Date</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Rate</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                      <th className="text-right px-4 py-3 text-gray-400 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {assignments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-white">{a.lockerNumber}</p>
                              <p className="text-xs text-gray-500">{a.lockerSize}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                              {a.memberName.charAt(0)}
                            </div>
                            <span className="text-gray-200">{a.memberName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{a.startDate}</td>
                        <td className="px-4 py-3">
                          {a.endDate ? (
                            <span className={a.expired ? "text-red-400 font-medium" : "text-gray-300"}>{a.endDate}</span>
                          ) : <span className="text-gray-600">–</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-300">Rs. {Number(a.monthlyRate).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                            a.status === "ACTIVE"
                              ? a.expired ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}>
                            {a.expired ? "Expired" : a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {a.status === "ACTIVE" && (
                            <button onClick={() => handleRelease(a.id, a.lockerNumber)} disabled={releasing}
                              className="flex items-center gap-1 ml-auto px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-medium transition-colors">
                              <LogOut className="w-3.5 h-3.5" /> Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAdd || editLocker) && (
        <AddLockerModal
          locker={editLocker}
          onClose={() => { setShowAdd(false); setEditLocker(null); }}
          onSaved={refetchAll} />
      )}
      {assignTarget && (
        <AssignLockerModal
          locker={assignTarget}
          onClose={() => setAssign(null)}
          onAssigned={refetchAll} />
      )}
    </div>
  );
}

// ── Locker Grid Card ──────────────────────────────────────────────────────────
function LockerCard({ locker, onAssign, onEdit, onDelete }: {
  locker: LockerDTO;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusColor = STATUS_COLORS[locker.status];
  return (
    <div className={`bg-gray-800 border rounded-xl p-4 flex flex-col gap-3 hover:border-gray-600 transition-colors ${
      locker.status === "AVAILABLE" ? "border-green-500/20" :
      locker.status === "OCCUPIED"  ? "border-yellow-500/20" : "border-orange-500/20"
    }`}>
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          locker.status === "AVAILABLE" ? "bg-green-500/10" :
          locker.status === "OCCUPIED"  ? "bg-yellow-500/10" : "bg-orange-500/10"
        }`}>
          <Lock className={`w-5 h-5 ${
            locker.status === "AVAILABLE" ? "text-green-400" :
            locker.status === "OCCUPIED"  ? "text-yellow-400" : "text-orange-400"
          }`} />
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
          {STATUS_ICONS[locker.status]} {locker.status}
        </span>
      </div>

      <div>
        <p className="text-white font-bold text-lg leading-tight">{locker.lockerNumber}</p>
        <p className="text-gray-500 text-xs mt-0.5">{locker.size} · Rs. {Number(locker.monthlyRate).toLocaleString()}/mo</p>
      </div>

      {locker.status === "OCCUPIED" && locker.assignedTo && (
        <div className="bg-yellow-500/10 rounded-lg px-2 py-1.5">
          <p className="text-xs text-yellow-300 font-medium truncate">{locker.assignedTo}</p>
          {locker.assignmentEnd && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {locker.assignmentEnd}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-1.5 mt-auto pt-1">
        {locker.status === "AVAILABLE" && (
          <button onClick={onAssign}
            className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors">
            Assign
          </button>
        )}
        <button onClick={onEdit}
          className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-lg transition-colors">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        {locker.status !== "OCCUPIED" && (
          <button onClick={onDelete}
            className="p-1.5 bg-gray-700 hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Locker List Table ─────────────────────────────────────────────────────────
function LockerTable({ lockers, onAssign, onEdit, onDelete }: {
  lockers: LockerDTO[];
  onAssign: (l: LockerDTO) => void;
  onEdit: (l: LockerDTO) => void;
  onDelete: (l: LockerDTO) => void;
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Locker</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Size</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Monthly Rate</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Assigned To</th>
            <th className="text-right px-4 py-3 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {lockers.map(l => (
            <tr key={l.id} className="hover:bg-gray-700/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-white">{l.lockerNumber}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-300">{l.size}</td>
              <td className="px-4 py-3 text-gray-300">Rs. {Number(l.monthlyRate).toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[l.status]}`}>
                  {STATUS_ICONS[l.status]} {l.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-300">
                {l.assignedTo ?? <span className="text-gray-600">–</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {l.status === "AVAILABLE" && (
                    <button onClick={() => onAssign(l)}
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors">
                      Assign
                    </button>
                  )}
                  <button onClick={() => onEdit(l)} className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {l.status !== "OCCUPIED" && (
                    <button onClick={() => onDelete(l)} className="p-1.5 hover:bg-red-600/10 rounded-lg text-gray-400 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
