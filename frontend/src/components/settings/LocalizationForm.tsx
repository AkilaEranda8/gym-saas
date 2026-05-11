"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { GymSettingsDTO, useUpdateGymSettings } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const sel = "w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] transition-colors";

const TIMEZONES = ["Asia/Colombo", "Asia/Kolkata", "UTC", "Asia/Dubai", "Europe/London", "America/New_York"];
const CURRENCIES = [{ code: "LKR", label: "Sri Lankan Rupee (LKR)" }, { code: "USD", label: "US Dollar (USD)" }, { code: "EUR", label: "Euro (EUR)" }, { code: "GBP", label: "British Pound (GBP)" }];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"];
const LANGUAGES = [{ code: "en", label: "English" }, { code: "si", label: "Sinhala" }, { code: "ta", label: "Tamil" }];

interface Props { settings: GymSettingsDTO; onSaved: (s: GymSettingsDTO) => void; }

export default function LocalizationForm({ settings, onSaved }: Props) {
  const { mutate, saving } = useUpdateGymSettings();
  const [form, setForm] = useState({
    timezone: settings.timezone ?? "Asia/Colombo",
    currency: settings.currency ?? "LKR",
    language: settings.language ?? "en",
    dateFormat: settings.dateFormat ?? "DD/MM/YYYY",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm({ timezone: settings.timezone ?? "Asia/Colombo", currency: settings.currency ?? "LKR", language: settings.language ?? "en", dateFormat: settings.dateFormat ?? "DD/MM/YYYY" });
    setDirty(false);
  }, [settings]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      const saved = await mutate({ ...settings, ...form });
      if (saved) { onSaved(saved); toast.success("Localization saved"); setDirty(false); }
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Timezone</label>
          <select value={form.timezone} onChange={set("timezone")} className={sel}>
            {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Currency</label>
          <select value={form.currency} onChange={set("currency")} className={sel}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Language</label>
          <select value={form.language} onChange={set("language")} className={sel}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Date Format</label>
          <select value={form.dateFormat} onChange={set("dateFormat")} className={sel}>
            {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
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
