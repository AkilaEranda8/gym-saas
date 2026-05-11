"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Palette } from "lucide-react";
import { GymSettingsDTO, useUpdateTheme } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const PRESET_COLORS = [
  { name: "Amber", primary: "#f59e0b", secondary: "#1e293b" },
  { name: "Blue", primary: "#3b82f6", secondary: "#0f172a" },
  { name: "Green", primary: "#22c55e", secondary: "#14532d" },
  { name: "Purple", primary: "#a855f7", secondary: "#1e1b4b" },
  { name: "Red", primary: "#ef4444", secondary: "#1c0505" },
  { name: "Cyan", primary: "#06b6d4", secondary: "#083344" },
];

interface Props { settings: GymSettingsDTO; onSaved: (s: GymSettingsDTO) => void; }

export default function ThemeCustomizer({ settings, onSaved }: Props) {
  const { mutate, saving } = useUpdateTheme();
  const [primary, setPrimary] = useState(settings.primaryColor ?? "#f59e0b");
  const [secondary, setSecondary] = useState(settings.secondaryColor ?? "#1e293b");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPrimary(settings.primaryColor ?? "#f59e0b");
    setSecondary(settings.secondaryColor ?? "#1e293b");
    setDirty(false);
  }, [settings]);

  const handleSave = async () => {
    try {
      const saved = await mutate({ primaryColor: primary, secondaryColor: secondary });
      if (saved) { onSaved(saved); toast.success("Theme saved"); setDirty(false); }
    } catch { toast.error("Failed to save theme"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        {PRESET_COLORS.map(c => (
          <button key={c.name} onClick={() => { setPrimary(c.primary); setSecondary(c.secondary); setDirty(true); }}
            className="group flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full border-2 transition-all"
              style={{ backgroundColor: c.primary, borderColor: primary === c.primary ? "#fff" : "transparent" }} />
            <span className="text-[10px] text-[#475569] group-hover:text-[#e2e8f0]">{c.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-2">Primary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={primary} onChange={e => { setPrimary(e.target.value); setDirty(true); }}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#1e293b]" />
            <input value={primary} onChange={e => { setPrimary(e.target.value); setDirty(true); }}
              className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] font-mono uppercase" maxLength={7} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-2">Secondary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={secondary} onChange={e => { setSecondary(e.target.value); setDirty(true); }}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#1e293b]" />
            <input value={secondary} onChange={e => { setSecondary(e.target.value); setDirty(true); }}
              className="flex-1 bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] font-mono uppercase" maxLength={7} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#1e293b] overflow-hidden">
        <div className="p-4" style={{ backgroundColor: secondary }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: primary }}>
              <Palette className="w-4 h-4 text-black" />
            </div>
            <span className="text-sm font-semibold text-white">Preview — {settings.gymName}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black" style={{ backgroundColor: primary }}>Primary Button</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border text-white" style={{ borderColor: primary, color: primary }}>Outline</button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        {dirty ? <span className="text-xs text-[#f59e0b]">Unsaved changes</span> : <span className="text-xs text-[#475569]">All changes saved</span>}
        <button onClick={handleSave} disabled={saving || !dirty}
          className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
          Apply Theme
        </button>
      </div>
    </div>
  );
}
