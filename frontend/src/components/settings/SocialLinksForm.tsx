"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Save, Facebook, Instagram, Youtube } from "lucide-react";
import { GymSettingsDTO, useUpdateGymSettings } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const inp = "w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b] transition-colors";

interface Props { settings: GymSettingsDTO; onSaved: (s: GymSettingsDTO) => void; }

export default function SocialLinksForm({ settings, onSaved }: Props) {
  const { mutate, saving } = useUpdateGymSettings();
  const [form, setForm] = useState({
    facebookUrl: settings.facebookUrl ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    youtubeUrl: settings.youtubeUrl ?? "",
    tiktokUrl: settings.tiktokUrl ?? "",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm({
      facebookUrl: settings.facebookUrl ?? "",
      instagramUrl: settings.instagramUrl ?? "",
      youtubeUrl: settings.youtubeUrl ?? "",
      tiktokUrl: settings.tiktokUrl ?? "",
    });
    setDirty(false);
  }, [settings]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      const saved = await mutate({ ...settings, ...form });
      if (saved) { onSaved(saved); toast.success("Social links saved"); setDirty(false); }
    } catch { toast.error("Failed to save"); }
  };

  const row = (icon: React.ReactNode, label: string, k: keyof typeof form, placeholder: string) => (
    <div>
      <label className="block text-xs font-medium text-[#475569] mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]">{icon}</span>
        <input value={form[k]} onChange={set(k)} className={`${inp} pl-9`} placeholder={placeholder} />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {row(<Facebook className="w-4 h-4" />, "Facebook Page", "facebookUrl", "https://facebook.com/yourpage")}
      {row(<Instagram className="w-4 h-4" />, "Instagram Profile", "instagramUrl", "https://instagram.com/yourpage")}
      {row(<Youtube className="w-4 h-4" />, "YouTube Channel", "youtubeUrl", "https://youtube.com/c/yourpage")}
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">TikTok</label>
        <input value={form.tiktokUrl} onChange={set("tiktokUrl")} className={inp} placeholder="https://tiktok.com/@yourpage" />
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
