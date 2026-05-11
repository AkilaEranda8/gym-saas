"use client";
import React, { useState } from "react";
import { Loader2, Lock, Zap } from "lucide-react";
import { AllFeaturesDTO, FeatureFlagDTO, useUpdateFeatureFlags } from "@/hooks/useSettings";
import toast from "react-hot-toast";

interface Props { features: AllFeaturesDTO; onUpdated: (f: AllFeaturesDTO) => void; }

const PLAN_COLORS: Record<string, string> = {
  STARTER: "text-[#64748b]",
  PRO: "text-[#f59e0b]",
  ENTERPRISE: "text-[#a855f7]",
};

export default function FeatureFlagsPanel({ features: init, onUpdated }: Props) {
  const { mutate, saving } = useUpdateFeatureFlags();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);

  const effectiveState = (f: FeatureFlagDTO) =>
    overrides[f.featureKey] !== undefined ? overrides[f.featureKey] : f.isEnabled;

  const toggle = (f: FeatureFlagDTO) => {
    if (!f.isAvailableOnCurrentPlan && !effectiveState(f)) {
      toast.error(`Upgrade to ${f.requiredPlan} to enable ${f.featureLabel}`);
      return;
    }
    setOverrides(p => ({ ...p, [f.featureKey]: !effectiveState(f) }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      const updated = await mutate(overrides);
      if (updated) { onUpdated(updated); setOverrides({}); setDirty(false); toast.success("Feature flags saved"); }
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-[#475569]">
        <span>Plan: <span className={`font-semibold ${PLAN_COLORS[init.currentPlan] ?? "text-[#e2e8f0]"}`}>{init.currentPlan}</span></span>
        <span>{init.enabledCount} enabled · {init.disabledCount} disabled</span>
      </div>

      <div className="space-y-1">
        {init.features.map(f => {
          const enabled = effectiveState(f);
          const locked = !f.isAvailableOnCurrentPlan && !enabled;
          return (
            <div key={f.featureKey}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${locked ? "opacity-60" : "hover:bg-[#111827]"}`}>
              <div className="flex items-center gap-3">
                {locked ? <Lock className="w-3.5 h-3.5 text-[#334155]" /> : <Zap className={`w-3.5 h-3.5 ${enabled ? "text-[#f59e0b]" : "text-[#334155]"}`} />}
                <div>
                  <p className="text-sm text-[#e2e8f0]">{f.featureLabel}</p>
                  <p className="text-xs text-[#475569]">{f.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {f.requiredPlan !== "STARTER" && (
                  <span className={`text-[10px] font-semibold ${PLAN_COLORS[f.requiredPlan] ?? ""}`}>
                    {f.requiredPlan}
                  </span>
                )}
                <button onClick={() => toggle(f)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${enabled ? "bg-[#f59e0b]" : "bg-[#1e293b]"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        {dirty ? <span className="text-xs text-[#f59e0b]">Unsaved changes</span> : <span className="text-xs text-[#475569]">All changes saved</span>}
        <button onClick={handleSave} disabled={saving || !dirty}
          className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold transition-colors">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
