"use client";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import {
  EquipmentDTO, EquipmentCategoryDTO,
  useCreateEquipment, useUpdateEquipment
} from "@/hooks/useEquipment";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  editing: EquipmentDTO | null;
  categories: EquipmentCategoryDTO[];
  onClose: () => void;
  onSaved: () => void;
}

const inp = "w-full bg-[#0f1729] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b]/50";
const lbl = "block text-xs font-medium text-[#94a3b8] mb-1";

export default function AddEquipmentModal({ open, editing, categories, onClose, onSaved }: Props) {
  const { create, loading: creating } = useCreateEquipment();
  const { update, loading: updating } = useUpdateEquipment();
  const loading = creating || updating;

  const [form, setForm] = useState<Record<string, unknown>>({ status: "OPERATIONAL", quantity: 1 });

  useEffect(() => {
    if (editing) setForm({ ...editing });
    else setForm({ status: "OPERATIONAL", quantity: 1 });
  }, [editing, open]);

  if (!open) return null;

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Name is required."); return; }
    const result = editing
      ? await update(editing.id, form)
      : await create(form);
    if (result) {
      toast.success(editing ? "Equipment updated." : "Equipment added.");
      onSaved(); onClose();
    } else {
      toast.error("Failed to save equipment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0d1526] border border-[#1e293b] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <h2 className="text-lg font-semibold text-[#e2e8f0]">{editing ? "Edit Equipment" : "Add Equipment"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[#1e293b] rounded-lg text-[#475569]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={lbl}>Name *</label>
              <input value={(form.name as string) ?? ""} onChange={(e) => set("name", e.target.value)} required
                className={inp} placeholder="e.g. Treadmill, Barbell Set..." />
            </div>

            <div className="col-span-2">
              <label className={lbl}>Description</label>
              <textarea value={(form.description as string) ?? ""} onChange={(e) => set("description", e.target.value)}
                rows={2} className={`${inp} resize-none`} placeholder="Brief description..." />
            </div>

            <div>
              <label className={lbl}>Category</label>
              <select value={(form.categoryId as string) ?? ""}
                onChange={(e) => set("categoryId", e.target.value || undefined)}
                className={inp}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className={lbl}>Status</label>
              <select value={(form.status as string) ?? "OPERATIONAL"}
                onChange={(e) => set("status", e.target.value)}
                className={inp}>
                {["OPERATIONAL","MAINTENANCE","OUT_OF_ORDER","UNDER_INSPECTION","RETIRED"].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={lbl}>Brand</label>
              <input value={(form.brand as string) ?? ""} onChange={(e) => set("brand", e.target.value)}
                className={inp} placeholder="e.g. Technogym, Life Fitness" />
            </div>

            <div>
              <label className={lbl}>Model</label>
              <input value={(form.model as string) ?? ""} onChange={(e) => set("model", e.target.value)}
                className={inp} placeholder="Model number" />
            </div>

            <div>
              <label className={lbl}>Serial Number</label>
              <input value={(form.serialNumber as string) ?? ""} onChange={(e) => set("serialNumber", e.target.value)}
                className={inp} />
            </div>

            <div>
              <label className={lbl}>Asset Tag</label>
              <input value={(form.assetTag as string) ?? ""} onChange={(e) => set("assetTag", e.target.value)}
                className={inp} placeholder="e.g. EQ-001" />
            </div>

            <div>
              <label className={lbl}>Location</label>
              <input value={(form.location as string) ?? ""} onChange={(e) => set("location", e.target.value)}
                className={inp} placeholder="e.g. Floor 1, Cardio Area" />
            </div>

            <div>
              <label className={lbl}>Quantity</label>
              <input type="number" min={1} value={(form.quantity as number) ?? 1}
                onChange={(e) => set("quantity", parseInt(e.target.value) || 1)}
                className={inp} />
            </div>

            <div>
              <label className={lbl}>Purchase Date</label>
              <input type="date" value={(form.purchaseDate as string) ?? ""}
                onChange={(e) => set("purchaseDate", e.target.value || undefined)}
                className={inp} />
            </div>

            <div>
              <label className={lbl}>Purchase Price (LKR)</label>
              <input type="number" min={0} value={(form.purchasePriceLkr as number) ?? ""}
                onChange={(e) => set("purchasePriceLkr", e.target.value ? parseInt(e.target.value) : undefined)}
                className={inp} placeholder="0" />
            </div>

            <div>
              <label className={lbl}>Warranty Expiry</label>
              <input type="date" value={(form.warrantyExpiry as string) ?? ""}
                onChange={(e) => set("warrantyExpiry", e.target.value || undefined)}
                className={inp} />
            </div>

            <div>
              <label className={lbl}>Service Interval (days)</label>
              <input type="number" min={1} value={(form.serviceIntervalDays as number) ?? ""}
                onChange={(e) => set("serviceIntervalDays", e.target.value ? parseInt(e.target.value) : undefined)}
                className={inp} placeholder="e.g. 90" />
            </div>

            <div>
              <label className={lbl}>Condition</label>
              <select value={(form.condition as string) ?? ""}
                onChange={(e) => set("condition", e.target.value || undefined)}
                className={inp}>
                <option value="">Not assessed</option>
                {["EXCELLENT","GOOD","FAIR","POOR"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className={lbl}>Notes</label>
              <textarea value={(form.notes as string) ?? ""} onChange={(e) => set("notes", e.target.value)}
                rows={2} className={`${inp} resize-none`} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-[#1e293b] rounded-xl text-sm text-[#94a3b8] hover:bg-[#1e293b] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-60 text-[#0d1526] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? "Update Equipment" : "Add Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
