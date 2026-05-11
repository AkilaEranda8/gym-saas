"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Wrench, Calendar, MapPin, Tag, AlertTriangle, CheckCircle,
  Plus, RefreshCw, QrCode, Edit2, Trash2, Clock, Star,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import {
  useEquipmentDetail, useEquipmentInspections, useServiceRecords,
  useDeleteEquipment, useUpdateEquipmentStatus,
  EquipmentDetailDTO, MaintenanceRequestDTO, ServiceRecordDTO,
  EquipmentStatus, EquipmentCondition,
} from "@/hooks/useEquipment";
import {
  EquipmentStatusBadge, EquipmentConditionBadge, ServiceDueBadge,
  PriorityBadge, MaintenanceStatusBadge, ServiceTypeBadge, InspectionRating, OverdueBadge,
} from "@/components/equipment/EquipmentBadges";
import MaintenanceRequestModal from "@/components/equipment/MaintenanceRequestModal";
import ServiceRecordModal from "@/components/equipment/ServiceRecordModal";
import toast from "react-hot-toast";

type Tab = "overview" | "maintenance" | "service" | "inspections";

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [reqOpen, setReqOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const [statusEdit, setStatusEdit] = useState(false);
  const [newStatus, setNewStatus] = useState<EquipmentStatus>("OPERATIONAL");
  const [newCondition, setNewCondition] = useState<EquipmentCondition | "">("");
  const [statusNotes, setStatusNotes] = useState("");

  const { equipment, loading, refetch } = useEquipmentDetail(id);
  const { inspections, loading: iLoading } = useEquipmentInspections(id);
  const { data: svcData, loading: svcLoading } = useServiceRecords(id);
  const { deleteEquipment } = useDeleteEquipment();
  const { updateStatus, loading: statusLoading } = useUpdateEquipmentStatus();

  const handleDelete = async () => {
    if (!equipment || !confirm(`Delete "${equipment.name}"?`)) return;
    const ok = await deleteEquipment(id);
    if (ok) { toast.success("Equipment deleted."); router.push("/equipment"); }
    else toast.error("Failed to delete equipment.");
  };

  const handleStatusUpdate = async () => {
    const ok = await updateStatus(id, {
      status: newStatus,
      condition: newCondition || undefined,
      notes: statusNotes || undefined,
    });
    if (ok) { toast.success("Status updated."); refetch(); setStatusEdit(false); }
    else toast.error("Failed to update status.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e]">
        <Header title="Equipment Detail" />
        <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#111827] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center text-[#475569]">
          <Wrench className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium text-[#94a3b8]">Equipment not found</p>
          <Link href="/equipment" className="mt-4 inline-flex items-center gap-2 text-[#f59e0b] hover:underline text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Equipment
          </Link>
        </div>
      </div>
    );
  }

  const serviceRecords = svcData?.content ?? [];

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Header title={equipment.name} />

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <Link href="/equipment" className="flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#f59e0b] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Equipment
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={refetch}
              className="p-2 border border-[#1e293b] rounded-xl text-[#475569] hover:bg-[#1e293b] transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { setNewStatus(equipment.status); setStatusEdit(true); }}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#1e293b] rounded-xl text-sm text-[#94a3b8] hover:bg-[#1e293b] transition-colors">
              <Edit2 className="w-3.5 h-3.5" /> Status
            </button>
            <button onClick={() => setReqOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-medium hover:bg-amber-500/20 transition-colors">
              <Wrench className="w-3.5 h-3.5" /> Maintenance
            </button>
            <button onClick={() => setSvcOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0f1e] rounded-xl text-sm font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" /> Log Service
            </button>
            <button onClick={handleDelete}
              className="p-2 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero card */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Left: main info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3 flex-wrap">
                {equipment.categoryColor && (
                  <span className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: equipment.categoryColor }} />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-[#e2e8f0]">{equipment.name}</h1>
                  {equipment.description && (
                    <p className="text-sm text-[#475569] mt-1">{equipment.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <EquipmentStatusBadge status={equipment.status} />
                {equipment.condition && <EquipmentConditionBadge condition={equipment.condition} />}
                {equipment.isServiceOverdue && <OverdueBadge />}
                {!equipment.isServiceOverdue && <ServiceDueBadge days={equipment.daysUntilService} />}
                {equipment.isWarrantyExpired && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                    <AlertTriangle className="w-3 h-3" /> Warranty Expired
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {equipment.brand && (
                  <InfoItem label="Brand" value={equipment.brand} />
                )}
                {equipment.model && (
                  <InfoItem label="Model" value={equipment.model} />
                )}
                {equipment.serialNumber && (
                  <InfoItem label="Serial No." value={equipment.serialNumber} mono />
                )}
                {equipment.assetTag && (
                  <InfoItem label="Asset Tag" value={equipment.assetTag} mono />
                )}
                {equipment.location && (
                  <InfoItem label="Location" value={equipment.location} icon={<MapPin className="w-3 h-3" />} />
                )}
                {equipment.categoryName && (
                  <InfoItem label="Category" value={equipment.categoryName} />
                )}
                <InfoItem label="Quantity" value={String(equipment.quantity)} />
                {equipment.purchaseDate && (
                  <InfoItem label="Purchased" value={new Date(equipment.purchaseDate).toLocaleDateString()} />
                )}
                {equipment.purchasePriceLkr && (
                  <InfoItem label="Purchase Price" value={`LKR ${equipment.purchasePriceLkr.toLocaleString()}`} />
                )}
                {equipment.warrantyExpiry && (
                  <InfoItem
                    label="Warranty Until"
                    value={new Date(equipment.warrantyExpiry).toLocaleDateString()}
                    danger={equipment.isWarrantyExpired}
                  />
                )}
              </div>
            </div>

            {/* Right: service & requests summary */}
            <div className="lg:w-64 space-y-3">
              <div className="bg-[#0d1526] border border-[#1e293b] rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-[#475569] uppercase tracking-wide">Service Summary</p>
                {equipment.lastServiceDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Last service</span>
                    <span className="text-[#94a3b8]">{new Date(equipment.lastServiceDate).toLocaleDateString()}</span>
                  </div>
                )}
                {equipment.nextServiceDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Next service</span>
                    <span className={equipment.isServiceOverdue ? "text-red-400" : "text-[#94a3b8]"}>
                      {new Date(equipment.nextServiceDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {equipment.serviceIntervalDays && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#475569]">Interval</span>
                    <span className="text-[#94a3b8]">{equipment.serviceIntervalDays} days</span>
                  </div>
                )}
                {equipment.totalMaintenanceCostLkr && (
                  <div className="flex justify-between text-xs border-t border-[#1e293b] pt-2 mt-2">
                    <span className="text-[#475569]">Total maint. cost</span>
                    <span className="text-[#94a3b8]">LKR {equipment.totalMaintenanceCostLkr.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {equipment.openRequestsCount > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-400">
                    {equipment.openRequestsCount} open maintenance request{equipment.openRequestsCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {equipment.qrCode && (
                <div className="bg-[#0d1526] border border-[#1e293b] rounded-xl p-3 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#475569]" />
                  <span className="text-xs text-[#475569] font-mono">{equipment.qrCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status change inline panel */}
        {statusEdit && (
          <div className="bg-[#111827] border border-[#f59e0b]/30 rounded-xl p-4">
            <p className="text-sm font-semibold text-[#e2e8f0] mb-3">Update Equipment Status</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as EquipmentStatus)}
                  className="bg-[#0f1729] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none">
                  {(["OPERATIONAL","MAINTENANCE","OUT_OF_ORDER","UNDER_INSPECTION","RETIRED"] as EquipmentStatus[]).map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g," ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Condition</label>
                <select value={newCondition} onChange={(e) => setNewCondition(e.target.value as EquipmentCondition | "")}
                  className="bg-[#0f1729] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none">
                  <option value="">Unchanged</option>
                  {(["EXCELLENT","GOOD","FAIR","POOR"] as EquipmentCondition[]).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-[#94a3b8] mb-1">Notes</label>
                <input value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Reason for status change..."
                  className="w-full bg-[#0f1729] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStatusEdit(false)}
                  className="px-3 py-2 border border-[#1e293b] rounded-lg text-sm text-[#94a3b8] hover:bg-[#1e293b] transition-colors">
                  Cancel
                </button>
                <button onClick={handleStatusUpdate} disabled={statusLoading}
                  className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 text-[#0a0f1e] rounded-lg text-sm font-semibold transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111827] border border-[#1e293b] rounded-xl p-1 w-fit">
          {([
            ["overview",     "Overview"],
            ["maintenance",  `Maintenance (${equipment.openRequests.length})`],
            ["service",      `Service (${serviceRecords.length})`],
            ["inspections",  `Inspections (${inspections.length})`],
          ] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === key ? "bg-[#f59e0b] text-[#0a0f1e]" : "text-[#94a3b8] hover:bg-[#1e293b]"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service schedules */}
            <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">Service Schedules</h3>
              {equipment.serviceSchedules.length === 0 ? (
                <p className="text-sm text-[#475569]">No service schedules configured.</p>
              ) : (
                <div className="space-y-3">
                  {equipment.serviceSchedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-[#0d1526] rounded-lg">
                      <div>
                        <ServiceTypeBadge serviceType={s.serviceType} />
                        <p className="text-xs text-[#475569] mt-1">Every {s.frequencyDays} days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#94a3b8]">
                          {new Date(s.nextServiceDate).toLocaleDateString()}
                        </p>
                        <ServiceDueBadge days={s.daysUntilService} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent service records */}
            <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">Recent Service Records</h3>
              {equipment.recentServiceRecords.length === 0 ? (
                <p className="text-sm text-[#475569]">No service records yet.</p>
              ) : (
                <div className="space-y-3">
                  {equipment.recentServiceRecords.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-[#0d1526] rounded-lg">
                      <div>
                        <ServiceTypeBadge serviceType={r.serviceType} />
                        <p className="text-xs text-[#475569] mt-1 truncate max-w-[180px]">{r.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#94a3b8]">{new Date(r.serviceDate).toLocaleDateString()}</p>
                        {r.costLkr && <p className="text-xs text-[#475569]">LKR {r.costLkr.toLocaleString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest inspection */}
            {equipment.latestInspection && (
              <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold text-[#e2e8f0] mb-4">Latest Inspection</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoItem label="Date" value={new Date(equipment.latestInspection.inspectionDate).toLocaleDateString()} />
                  <InfoItem label="Inspector" value={equipment.latestInspection.inspectedByName ?? "—"} />
                  <div>
                    <p className="text-xs text-[#475569] mb-1">Rating</p>
                    <InspectionRating rating={equipment.latestInspection.overallRating} />
                  </div>
                  <div>
                    <p className="text-xs text-[#475569] mb-1">Operational</p>
                    {equipment.latestInspection.isOperational
                      ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" /> Yes</span>
                      : <span className="flex items-center gap-1 text-xs text-red-400"><AlertTriangle className="w-3 h-3" /> No</span>
                    }
                  </div>
                  {equipment.latestInspection.issuesFound && (
                    <div className="col-span-2">
                      <p className="text-xs text-[#475569] mb-1">Issues Found</p>
                      <p className="text-xs text-[#94a3b8]">{equipment.latestInspection.issuesFound}</p>
                    </div>
                  )}
                  {equipment.latestInspection.actionsRequired && (
                    <div className="col-span-2">
                      <p className="text-xs text-[#475569] mb-1">Actions Required</p>
                      <p className="text-xs text-[#94a3b8]">{equipment.latestInspection.actionsRequired}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {equipment.notes && (
              <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold text-[#e2e8f0] mb-2">Notes</h3>
                <p className="text-sm text-[#94a3b8] whitespace-pre-wrap">{equipment.notes}</p>
              </div>
            )}
          </div>
        )}

        {tab === "maintenance" && (
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#e2e8f0]">Maintenance Requests</h3>
              <button onClick={() => setReqOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0f1e] rounded-lg text-xs font-semibold transition-colors">
                <Plus className="w-3 h-3" /> New Request
              </button>
            </div>
            <div className="divide-y divide-[#1e293b]">
              {equipment.openRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#475569]">
                  <CheckCircle className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No open requests</p>
                </div>
              ) : equipment.openRequests.map((r) => (
                <div key={r.id} className="p-4 hover:bg-[#0f1729] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-[#475569]">{r.requestNumber}</span>
                        <PriorityBadge priority={r.priority} />
                        <MaintenanceStatusBadge status={r.status} />
                        {r.isOverdue && <OverdueBadge />}
                      </div>
                      <p className="text-sm font-medium text-[#e2e8f0]">{r.title}</p>
                      {r.description && (
                        <p className="text-xs text-[#475569] mt-1 line-clamp-2">{r.description}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 text-xs text-[#475569]">
                      {r.dueDate && <p>Due: {new Date(r.dueDate).toLocaleDateString()}</p>}
                      {r.assignedToName && <p>→ {r.assignedToName}</p>}
                      {r.estimatedCostLkr && <p>~LKR {r.estimatedCostLkr.toLocaleString()}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "service" && (
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#e2e8f0]">Service Records</h3>
              <button onClick={() => setSvcOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a0f1e] rounded-lg text-xs font-semibold transition-colors">
                <Plus className="w-3 h-3" /> Log Service
              </button>
            </div>
            {svcLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-[#0f1729] animate-pulse" />
                ))}
              </div>
            ) : serviceRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#475569]">
                <Calendar className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No service records yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e293b]">
                {serviceRecords.map((r) => (
                  <div key={r.id} className="p-4 hover:bg-[#0f1729] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <ServiceTypeBadge serviceType={r.serviceType} />
                          <span className="text-xs text-[#475569]">{new Date(r.serviceDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-[#e2e8f0] line-clamp-2">{r.description}</p>
                        {r.partsReplaced?.length > 0 && (
                          <p className="text-xs text-[#475569] mt-1">Parts: {r.partsReplaced.join(", ")}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 text-xs text-[#475569] space-y-0.5">
                        {r.performedBy && <p>{r.performedBy}</p>}
                        {r.costLkr && <p className="text-[#94a3b8]">LKR {r.costLkr.toLocaleString()}</p>}
                        {r.durationHours && <p>{r.durationHours}h</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "inspections" && (
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl">
            <div className="p-4 border-b border-[#1e293b]">
              <h3 className="text-sm font-semibold text-[#e2e8f0]">Inspection History</h3>
            </div>
            {iLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-[#0f1729] animate-pulse" />
                ))}
              </div>
            ) : inspections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#475569]">
                <Star className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No inspections recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1e293b]">
                {inspections.map((ins) => (
                  <div key={ins.id} className="p-4 hover:bg-[#0f1729] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-xs text-[#475569]">
                            {new Date(ins.inspectionDate).toLocaleDateString()}
                          </span>
                          <InspectionRating rating={ins.overallRating} />
                          {ins.isOperational
                            ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" /> Operational</span>
                            : <span className="flex items-center gap-1 text-xs text-red-400"><AlertTriangle className="w-3 h-3" /> Non-operational</span>
                          }
                        </div>
                        {ins.issuesFound && (
                          <p className="text-xs text-amber-400 mt-1">Issues: {ins.issuesFound}</p>
                        )}
                        {ins.actionsRequired && (
                          <p className="text-xs text-[#94a3b8] mt-0.5">Actions: {ins.actionsRequired}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 text-xs text-[#475569]">
                        {ins.inspectedByName && <p>{ins.inspectedByName}</p>}
                        {ins.nextInspectionDate && (
                          <p>Next: {new Date(ins.nextInspectionDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <MaintenanceRequestModal
        open={reqOpen}
        equipmentId={id}
        equipmentName={equipment.name}
        onClose={() => setReqOpen(false)}
        onSaved={refetch}
      />
      <ServiceRecordModal
        open={svcOpen}
        equipmentId={id}
        equipmentName={equipment.name}
        onClose={() => setSvcOpen(false)}
        onSaved={refetch}
      />
    </div>
  );
}

function InfoItem({
  label, value, mono, icon, danger,
}: {
  label: string; value: string; mono?: boolean; icon?: React.ReactNode; danger?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-[#475569] mb-0.5">{label}</p>
      <p className={`text-sm flex items-center gap-1 ${mono ? "font-mono" : ""} ${danger ? "text-red-400" : "text-[#94a3b8]"}`}>
        {icon}{value}
      </p>
    </div>
  );
}
