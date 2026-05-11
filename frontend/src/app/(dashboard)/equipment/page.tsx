"use client";
import { useState } from "react";
import { Plus, RefreshCw, Wrench, ClipboardList, LayoutGrid, List, Search, Filter, Calendar } from "lucide-react";
import Header from "@/components/Header";
import {
  useEquipmentList, useEquipmentStats, useEquipmentCategories,
  useMaintenanceList, useDeleteEquipment,
  EquipmentDTO, MaintenanceRequestDTO,
  EquipmentStatus, MaintenancePriority, MaintenanceStatus,
} from "@/hooks/useEquipment";
import EquipmentStatsCards from "@/components/equipment/EquipmentStatsCards";
import EquipmentTable from "@/components/equipment/EquipmentTable";
import EquipmentCard from "@/components/equipment/EquipmentCard";
import MaintenanceTable from "@/components/equipment/MaintenanceTable";
import AddEquipmentModal from "@/components/equipment/AddEquipmentModal";
import MaintenanceRequestModal from "@/components/equipment/MaintenanceRequestModal";
import toast from "react-hot-toast";

type Tab      = "equipment" | "maintenance";
type ViewMode = "table" | "grid";

export default function EquipmentPage() {
  const [tab, setTab]       = useState<Tab>("equipment");
  const [view, setView]     = useState<ViewMode>("table");
  const [page, setPage]     = useState(0);
  const [mPage, setMPage]   = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus]   = useState<EquipmentStatus | "">("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState<MaintenancePriority | "">("");
  const [filterMStatus, setFilterMStatus]   = useState<MaintenanceStatus | "">("");

  const [addOpen, setAddOpen]   = useState(false);
  const [editing, setEditing]   = useState<EquipmentDTO | null>(null);
  const [reqOpen, setReqOpen]   = useState(false);
  const [reqTarget, setReqTarget] = useState<EquipmentDTO | null>(null);

  const { stats, loading: statsLoading, refetch: refetchStats } = useEquipmentStats();
  const { categories } = useEquipmentCategories();
  const { deleteEquipment } = useDeleteEquipment();

  const { data: equipData, loading: eLoading, refetch: refetchEquip } = useEquipmentList({
    page, size: 20,
    status: filterStatus || undefined,
    categoryId: filterCategory || undefined,
    search: debouncedSearch || undefined,
  });

  const { data: maintData, loading: mLoading, refetch: refetchMaint } = useMaintenanceList({
    page: mPage, size: 20,
    priority: filterPriority || undefined,
    status: filterMStatus || undefined,
  });

  const equipment  = equipData?.content ?? [];
  const totalPages = equipData?.totalPages ?? 0;
  const requests   = maintData?.content ?? [];
  const mTotalPages = maintData?.totalPages ?? 0;

  let searchTimer: ReturnType<typeof setTimeout>;
  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { setDebouncedSearch(v); setPage(0); }, 350);
  };

  const handleDelete = async (e: EquipmentDTO) => {
    if (!confirm(`Delete "${e.name}"?`)) return;
    const ok = await deleteEquipment(e.id);
    if (ok) { toast.success("Equipment deleted."); refetchEquip(); refetchStats(); }
    else toast.error("Failed to delete equipment.");
  };

  const refetchAll = () => { refetchEquip(); refetchMaint(); refetchStats(); };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Header title="Equipment & Maintenance" />

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <EquipmentStatsCards stats={stats} loading={statsLoading} />

        {/* Tab bar + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1 w-fit">
            {([
              ["equipment",    <Wrench className="w-4 h-4" />,       `Equipment${equipData ? ` (${equipData.totalElements})` : ""}`],
              ["maintenance",  <ClipboardList className="w-4 h-4" />, `Requests${maintData ? ` (${maintData.totalElements})` : ""}`],
            ] as [Tab, React.ReactNode, string][]).map(([key, icon, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${tab === key ? "bg-[#f59e0b] text-[#0a0f1e]" : "text-[#94a3b8] hover:bg-[#1e293b]"}`}>
                {icon}{label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={refetchAll}
              className="p-2 border border-[#1e293b] rounded-xl text-[#475569] hover:bg-[#1e293b] transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            {tab === "equipment" && (
              <>
                <div className="flex gap-1 border border-[#1e293b] rounded-xl p-1 bg-[#111827]">
                  <button onClick={() => setView("table")}
                    className={`p-1.5 rounded-lg transition-colors ${view === "table" ? "bg-[#1e293b] text-[#e2e8f0]" : "text-[#475569]"}`}>
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setView("grid")}
                    className={`p-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-[#1e293b] text-[#e2e8f0]" : "text-[#475569]"}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => { setEditing(null); setAddOpen(true); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0f1e] rounded-xl text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" /> Add Equipment
                </button>
              </>
            )}
            {tab === "maintenance" && (
              <button onClick={() => { setReqTarget(null); setReqOpen(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0f1e] rounded-xl text-sm font-semibold transition-colors">
                <Plus className="w-4 h-4" /> New Request
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {tab === "equipment" && (
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
              <input value={search} onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search equipment..."
                className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-[#1e293b] rounded-xl text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50" />
            </div>
            <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
              className="bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] focus:outline-none">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as EquipmentStatus | ""); setPage(0); }}
              className="bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] focus:outline-none">
              <option value="">All Statuses</option>
              {(["OPERATIONAL","MAINTENANCE","OUT_OF_ORDER","UNDER_INSPECTION","RETIRED"] as EquipmentStatus[]).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g," ")}</option>
              ))}
            </select>
          </div>
        )}

        {tab === "maintenance" && (
          <div className="flex flex-wrap gap-2">
            <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value as MaintenancePriority | ""); setMPage(0); }}
              className="bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] focus:outline-none">
              <option value="">All Priorities</option>
              {(["LOW","MEDIUM","HIGH","CRITICAL"] as MaintenancePriority[]).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select value={filterMStatus} onChange={(e) => { setFilterMStatus(e.target.value as MaintenanceStatus | ""); setMPage(0); }}
              className="bg-[#111827] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-[#94a3b8] focus:outline-none">
              <option value="">All Statuses</option>
              {(["OPEN","IN_PROGRESS","RESOLVED","CLOSED","CANCELLED"] as MaintenanceStatus[]).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g," ")}</option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        {tab === "equipment" ? (
          <>
            {view === "table" ? (
              <EquipmentTable
                equipment={equipment}
                loading={eLoading}
                onEdit={(e) => { setEditing(e); setAddOpen(true); }}
                onNewRequest={(e) => { setReqTarget(e); setReqOpen(true); }}
                onDelete={handleDelete}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {eLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-48 rounded-xl bg-[#111827] animate-pulse" />
                    ))
                  : equipment.map((e) => (
                      <EquipmentCard
                        key={e.id}
                        equipment={e}
                        onStatusChange={() => refetchEquip()}
                      />
                    ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 pt-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                      ${page === i ? "bg-[#f59e0b] text-[#0a0f1e]" : "bg-[#111827] border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <MaintenanceTable requests={requests} loading={mLoading} />
            {mTotalPages > 1 && (
              <div className="flex justify-center gap-1.5 pt-2">
                {Array.from({ length: mTotalPages }).map((_, i) => (
                  <button key={i} onClick={() => setMPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                      ${mPage === i ? "bg-[#f59e0b] text-[#0a0f1e]" : "bg-[#111827] border border-[#1e293b] text-[#94a3b8] hover:bg-[#1e293b]"}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AddEquipmentModal
        open={addOpen}
        editing={editing}
        categories={categories}
        onClose={() => { setAddOpen(false); setEditing(null); }}
        onSaved={() => { refetchEquip(); refetchStats(); }}
      />
      <MaintenanceRequestModal
        open={reqOpen}
        equipmentId={reqTarget?.id}
        equipmentName={reqTarget?.name}
        onClose={() => { setReqOpen(false); setReqTarget(null); }}
        onSaved={() => { refetchMaint(); refetchStats(); }}
      />
    </div>
  );
}
