"use client";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCreateServiceRecord } from "@/hooks/useEquipment";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  equipmentId: string;
  equipmentName?: string;
  onClose: () => void;
  onSaved: () => void;
}

const inp = "w-full bg-[#0f1729] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50";
const lbl = "block text-xs font-medium text-[#94a3b8] mb-1";

export default function ServiceRecordModal({ open, equipmentId, equipmentName, onClose, onSaved }: Props) {
  const { create, loading } = useCreateServiceRecord();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<Record<string, unknown>>({
    equipmentId,
    serviceType: "ROUTINE",
    serviceDate: today,
  });

  useEffect(() => {
    if (open) setForm({ equipmentId, serviceType: "ROUTINE", serviceDate: today });
  }, [open, equipmentId]);

  if (!open) return null;

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description) { toast.error("Description is required."); return; }
    const result = await create(form);
    if (result) {
      toast.success("Service record added.");
      onSaved(); onClose();
    } else {
      toast.error("Failed to save service record.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0d1526] border border-[#1e293b] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div>
            <h2 className="text-lg font-semibold text-[#e2e8f0]">Log Service Record</h2>
            {equipmentName && <p className="text-xs text-[#475569] mt-0.5">{equipmentName}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1e293b] rounded-lg text-[#475569]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Service Type *</label>
              <select value={(form.serviceType as string) ?? "ROUTINE"}
                onChange={(e) => set("serviceType", e.target.value)} className={inp}>
                {["ROUTINE","DEEP_CLEAN","CALIBRATION","INSPECTION","PARTS_REPLACEMENT","OTHER"].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g," ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={lbl}>Service Date *</label>
              <input type="date" value={(form.serviceDate as string) ?? today}
                onChange={(e) => set("serviceDate", e.target.value)} required className={inp} />
            </div>

            <div className="col-span-2">
              <label className={lbl}>Description *</label>
              <textarea value={(form.description as string) ?? ""} onChange={(e) => set("description", e.target.value)}
                rows={3} required className={`${inp} resize-none`} placeholder="What was done..." />
            </div>

            <div>
              <label className={lbl}>Performed By</label>
              <input value={(form.performedBy as string) ?? ""} onChange={(e) => set("performedBy", e.target.value)}
                className={inp} placeholder="Technician name" />
            </div>

            <div>
              <label className={lbl}>Service Provider</label>
              <input value={(form.serviceProvider as string) ?? ""} onChange={(e) => set("serviceProvider", e.target.value)}
                className={inp} placeholder="Company name" />
            </div>

            <div>
              <label className={lbl}>Cost (LKR)</label>
              <input type="number" min={0} value={(form.costLkr as number) ?? ""}
                onChange={(e) => set("costLkr", e.target.value ? parseInt(e.target.value) : undefined)}
                className={inp} placeholder="0" />
            </div>

            <div>
              <label className={lbl}>Duration (hours)</label>
              <input type="number" min={0} step="0.5" value={(form.durationHours as number) ?? ""}
                onChange={(e) => set("durationHours", e.target.value ? parseFloat(e.target.value) : undefined)}
                className={inp} placeholder="e.g. 2.5" />
            </div>

            <div>
              <label className={lbl}>Condition Before</label>
              <select value={(form.conditionBefore as string) ?? ""}
                onChange={(e) => set("conditionBefore", e.target.value || undefined)} className={inp}>
                <option value="">Select</option>
                {["EXCELLENT","GOOD","FAIR","POOR"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Condition After</label>
              <select value={(form.conditionAfter as string) ?? ""}
                onChange={(e) => set("conditionAfter", e.target.value || undefined)} className={inp}>
                <option value="">Select</option>
                {["EXCELLENT","GOOD","FAIR","POOR"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Next Service Date</label>
              <input type="date" value={(form.nextServiceDate as string) ?? ""}
                onChange={(e) => set("nextServiceDate", e.target.value || undefined)} className={inp} />
            </div>

            <div>
              <label className={lbl}>Parts Replaced</label>
              <input value={(form.partsReplacedRaw as string) ?? ""}
                onChange={(e) => {
                  set("partsReplacedRaw", e.target.value);
                  set("partsReplaced", e.target.value ? e.target.value.split(",").map((s) => s.trim()) : []);
                }}
                className={inp} placeholder="part1, part2 (comma-separated)" />
            </div>

            <div className="col-span-2">
              <label className={lbl}>Notes</label>
              <textarea value={(form.notes as string) ?? ""} onChange={(e) => set("notes", e.target.value)}
                rows={2} className={`${inp} resize-none`} />
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
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
