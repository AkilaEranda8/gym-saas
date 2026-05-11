"use client";
import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { EquipmentDTO, ServiceType, useCreateServiceSchedule } from "@/hooks/useEquipment";
import toast from "react-hot-toast";

interface Props {
  equipment: EquipmentDTO | null;
  onClose: () => void;
  onScheduled: () => void;
}

const TYPES: ServiceType[] = ["ROUTINE", "DEEP_CLEAN", "CALIBRATION", "INSPECTION", "PARTS_REPLACEMENT", "OTHER"];

export default function ScheduleMaintenanceModal({ equipment, onClose, onScheduled }: Props) {
  const { create: schedule, loading } = useCreateServiceSchedule();
  const [type, setType]              = useState<ServiceType>("ROUTINE");
  const [scheduledDate, setDate]     = useState("");
  const [description, setDesc]       = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [cost, setCost]              = useState("");

  if (!equipment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) { toast.error("Scheduled date is required."); return; }
    const result = await schedule({
      equipmentId: equipment.id,
      serviceType: type,
      scheduledDate,
      description: description || undefined,
      performedBy: performedBy || undefined,
      estimatedCostLkr: cost ? parseFloat(cost) : undefined,
    });
    if (result) {
      toast.success("Maintenance scheduled.");
      onScheduled(); onClose();
      setDate(""); setDesc(""); setPerformedBy(""); setCost("");
    } else {
      toast.error("Failed to schedule maintenance.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Schedule Maintenance</h2>
            <p className="text-xs text-slate-400">{equipment.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as ServiceType)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Scheduled Date *</label>
              <input type="date" value={scheduledDate} onChange={(e) => setDate(e.target.value)} required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="What needs to be done..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Performed By</label>
              <input value={performedBy} onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Technician name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Est. Cost (Rs.)</label>
              <input type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
