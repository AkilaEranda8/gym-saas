"use client";
import React, { useState } from "react";
import { Loader2, Plus, X, Tag } from "lucide-react";
import { MembershipPlanConfigDTO, useUpdatePlan } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const inp = "w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b] transition-colors";

interface Props {
  plan: MembershipPlanConfigDTO;
  onUpdated: (p: MembershipPlanConfigDTO) => void;
}

export default function MembershipPlanEditor({ plan: init, onUpdated }: Props) {
  const { mutate, saving } = useUpdatePlan();
  const [plan, setPlan] = useState(init);
  const [features, setFeatures] = useState<string[]>(init.features ?? []);
  const [newFeature, setNewFeature] = useState("");
  const [dirty, setDirty] = useState(false);

  const update = <K extends keyof MembershipPlanConfigDTO>(k: K, v: MembershipPlanConfigDTO[K]) => {
    setPlan(p => ({ ...p, [k]: v }));
    setDirty(true);
  };

  const addFeature = () => {
    const f = newFeature.trim();
    if (!f) return;
    setFeatures(p => [...p, f]);
    setNewFeature("");
    setDirty(true);
  };

  const removeFeature = (i: number) => {
    setFeatures(p => p.filter((_, idx) => idx !== i));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!plan.priceLkr || plan.priceLkr <= 0) { toast.error("Price must be > 0"); return; }
    try {
      const saved = await mutate(plan.planName, {
        displayName: plan.displayName,
        priceLkr: plan.priceLkr,
        durationDays: plan.durationDays,
        color: plan.color,
        description: plan.description,
        features,
        maxClassesPerWeek: plan.maxClassesPerWeek,
        maxPtSessions: plan.maxPtSessions,
        lockerIncluded: plan.lockerIncluded,
        guestPasses: plan.guestPasses,
        discountPct: plan.discountPct,
        isActive: plan.isActive,
      });
      if (saved) { onUpdated(saved); toast.success(`${saved.displayName} saved`); setDirty(false); }
    } catch { toast.error("Failed to save plan"); }
  };

  return (
    <div className="border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1e293b]"
        style={{ borderLeftColor: plan.color ?? "#f59e0b", borderLeftWidth: 4 }}>
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: plan.color ?? "#f59e0b" }} />
        <span className="text-sm font-semibold text-[#e2e8f0]">{plan.planName}</span>
        <span className="text-xs text-[#475569]">{plan.priceFormatted}</span>
        <label className="ml-auto flex items-center gap-2 text-xs text-[#94a3b8] cursor-pointer">
          <input type="checkbox" checked={plan.isActive} onChange={e => update("isActive", e.target.checked)} className="rounded" />
          Active
        </label>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">Display Name</label>
            <input value={plan.displayName} onChange={e => update("displayName", e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">Price (LKR cents)</label>
            <input type="number" value={plan.priceLkr} onChange={e => update("priceLkr", Number(e.target.value))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">Duration (days)</label>
            <input type="number" value={plan.durationDays} onChange={e => update("durationDays", Number(e.target.value))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">Colour</label>
            <div className="flex items-center gap-2">
              <input type="color" value={plan.color ?? "#f59e0b"} onChange={e => update("color", e.target.value)} className="w-9 h-9 rounded-lg bg-transparent border border-[#1e293b] cursor-pointer" />
              <input value={plan.color ?? ""} onChange={e => update("color", e.target.value)} className={`${inp} font-mono`} maxLength={7} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">Max Classes/Week (-1 = unlimited)</label>
            <input type="number" value={plan.maxClassesPerWeek} onChange={e => update("maxClassesPerWeek", Number(e.target.value))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">PT Sessions/Month</label>
            <input type="number" value={plan.maxPtSessions} onChange={e => update("maxPtSessions", Number(e.target.value))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">Guest Passes</label>
            <input type="number" value={plan.guestPasses} onChange={e => update("guestPasses", Number(e.target.value))} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#475569] mb-1">Discount %</label>
            <input type="number" step="0.01" value={plan.discountPct} onChange={e => update("discountPct", Number(e.target.value))} className={inp} />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-[#475569] cursor-pointer">
            <input type="checkbox" checked={plan.lockerIncluded} onChange={e => update("lockerIncluded", e.target.checked)} className="rounded" />
            Locker Included
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#475569] mb-2">Features</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {features.map((f, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-[#1e293b] rounded-full text-xs text-[#94a3b8]">
                <Tag className="w-2.5 h-2.5" /> {f}
                <button onClick={() => removeFeature(i)} className="ml-0.5 text-[#475569] hover:text-red-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newFeature} onChange={e => setNewFeature(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addFeature()}
              className={inp} placeholder="Add feature..." />
            <button onClick={addFeature} className="px-3 py-2 bg-[#1e293b] hover:bg-[#2d3f55] rounded-lg text-[#94a3b8] transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          {dirty ? <span className="text-xs text-[#f59e0b]">Unsaved changes</span> : <span className="text-xs text-[#475569]">All changes saved</span>}
          <button onClick={handleSave} disabled={saving || !dirty}
            className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold transition-colors">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Plan
          </button>
        </div>
      </div>
    </div>
  );
}
