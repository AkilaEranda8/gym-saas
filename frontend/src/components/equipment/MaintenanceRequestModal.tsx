"use client";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { EquipmentDTO, MaintenanceRequestDTO, useCreateMaintenanceRequest, useUpdateMaintenanceStatus } from "@/hooks/useEquipment";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  equipmentId?: string;
  equipmentName?: string;
  editing?: MaintenanceRequestDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

const inp = "w-full bg-[#0f1729] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50";
const lbl = "block text-xs font-medium text-[#94a3b8] mb-1";

export default function MaintenanceRequestModal({ open, equipmentId, equipmentName, editing, onClose, onSaved }: Props) {
  const { create, loading: creating } = useCreateMaintenanceRequest();
  const { updateStatus, loading: updating } = useUpdateMaintenanceStatus();
  const loading = creating || updating;

  const [form, setForm] = useState<Record<string, unknown>>({
    priority: "MEDIUM",
    equipmentId: equipmentId ?? "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        priority: editing.priority,
        title: editing.title,
        description: editing.description,
        assignedTo: editing.assignedTo,
        assignedToName: editing.assignedToName,
        estimatedCostLkr: editing.estimatedCostLkr,
        dueDate: editing.dueDate,
      });
    } else {
      setForm({ priority: "MEDIUM", equipmentId: equipmentId ?? "" });
    }
  }, [editing, equipmentId, open]);

  if (!open) return null;

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { toast.error("Title is required."); return; }
    const result = await create(form);
    if (result) {
      toast.success("Maintenance request created.");
      onSaved(); onClose();
    } else {
      toast.error("Failed to create maintenance request.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0d1526] border border-[#1e293b] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">New Maintenance Request</h2>
            {equipmentName && <p className="text-xs text-[#475569] mt-0.5">{equipmentName}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1e293b] rounded-lg text-[#475569]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!equipmentId && (
            <div>
              <label className={lbl}>Equipment ID *</label>
              <input value={(form.equipmentId as string) ?? ""} onChange={(e) => set("equipmentId", e.target.value)}
                required className={inp} placeholder="Equipment UUID" />
            </div>
          )}

          <div>
            <label className={lbl}>Title *</label>
            <input value={(form.title as string) ?? ""} onChange={(e) => set("title", e.target.value)}
              required className={inp} placeholder="Brief description of the issue" />
          </div>

          <div>
            <label className={lbl}>Description</label>
            <textarea value={(form.description as string) ?? ""} onChange={(e) => set("description", e.target.value)}
              rows={3} className={`${inp} resize-none`} placeholder="Detailed description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Priority *</label>
              <select value={(form.priority as string) ?? "MEDIUM"} onChange={(e) => set("priority", e.target.value)} className={inp}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">🔴 Critical</option>
              </select>
            </div>

            <div>
              <label className={lbl}>Due Date</label>
              <input type="date" value={(form.dueDate as string) ?? ""} onChange={(e) => set("dueDate", e.target.value || undefined)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Assign To</label>
              <input value={(form.assignedToName as string) ?? ""} onChange={(e) => set("assignedToName", e.target.value)}
                className={inp} placeholder="Technician name" />
            </div>

            <div>
              <label className={lbl}>Est. Cost (LKR)</label>
              <input type="number" min={0} value={(form.estimatedCostLkr as number) ?? ""}
                onChange={(e) => set("estimatedCostLkr", e.target.value ? parseInt(e.target.value) : undefined)}
                className={inp} placeholder="0" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-[#1e293b] rounded-xl text-sm text-[#94a3b8] hover:bg-[#1e293b] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 text-[#0d1526] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
