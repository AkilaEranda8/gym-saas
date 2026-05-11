"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { GymSettingsDTO, useUpdateGymSettings } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const inp = "w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b] transition-colors";
const ta = `${inp} resize-none`;

interface Props { settings: GymSettingsDTO; onSaved: (s: GymSettingsDTO) => void; }

export default function GymInfoForm({ settings, onSaved }: Props) {
  const { mutate, saving } = useUpdateGymSettings();
  const [form, setForm] = useState({
    gymName: settings.gymName ?? "",
    tagline: settings.tagline ?? "",
    description: settings.description ?? "",
    phone: settings.phone ?? "",
    whatsappNumber: settings.whatsappNumber ?? "",
    email: settings.email ?? "",
    website: settings.website ?? "",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm({
      gymName: settings.gymName ?? "",
      tagline: settings.tagline ?? "",
      description: settings.description ?? "",
      phone: settings.phone ?? "",
      whatsappNumber: settings.whatsappNumber ?? "",
      email: settings.email ?? "",
      website: settings.website ?? "",
    });
    setDirty(false);
  }, [settings]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!form.gymName.trim()) { toast.error("Gym name is required"); return; }
    try {
      const saved = await mutate(form);
      if (saved) { onSaved(saved); toast.success("Gym info saved"); setDirty(false); }
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Gym Name *</label>
        <input value={form.gymName} onChange={set("gymName")} className={inp} placeholder="PowerHouse Gym" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Tagline</label>
        <input value={form.tagline} onChange={set("tagline")} className={inp} placeholder="Train harder. Live stronger." />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Description</label>
        <textarea value={form.description} onChange={set("description")} rows={3} className={ta} placeholder="About your gym..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Phone</label>
          <input value={form.phone} onChange={set("phone")} className={inp} placeholder="+94 77 000 0000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">WhatsApp Number</label>
          <input value={form.whatsappNumber} onChange={set("whatsappNumber")} className={inp} placeholder="+94 77 000 0000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Email</label>
          <input value={form.email} onChange={set("email")} type="email" className={inp} placeholder="info@gym.lk" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Website</label>
          <input value={form.website} onChange={set("website")} className={inp} placeholder="https://gym.lk" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2">
        {dirty ? <span className="text-xs text-[#f59e0b]">Unsaved changes</span> : <span className="text-xs text-[#475569]">All changes saved</span>}
        <button onClick={handleSave} disabled={saving || !dirty}
          className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}
