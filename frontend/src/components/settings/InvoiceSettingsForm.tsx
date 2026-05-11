"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { GymSettingsDTO, useUpdateGymSettings } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const inp = "w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b] transition-colors";
const ta = `${inp} resize-none`;

interface Props { settings: GymSettingsDTO; onSaved: (s: GymSettingsDTO) => void; }

export default function InvoiceSettingsForm({ settings, onSaved }: Props) {
  const { mutate, saving } = useUpdateGymSettings();
  const [form, setForm] = useState({
    invoicePrefix: settings.invoicePrefix ?? "INV",
    invoiceFooter: settings.invoiceFooter ?? "",
    invoiceTerms: settings.invoiceTerms ?? "",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm({ invoicePrefix: settings.invoicePrefix ?? "INV", invoiceFooter: settings.invoiceFooter ?? "", invoiceTerms: settings.invoiceTerms ?? "" });
    setDirty(false);
  }, [settings]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      const saved = await mutate({ ...settings, ...form });
      if (saved) { onSaved(saved); toast.success("Invoice settings saved"); setDirty(false); }
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Invoice Number Prefix</label>
        <input value={form.invoicePrefix} onChange={set("invoicePrefix")} className={inp} placeholder="INV" maxLength={10} />
        <p className="text-[11px] text-[#334155] mt-1">Invoices will be numbered like: {form.invoicePrefix}-000001</p>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Invoice Footer Note</label>
        <textarea value={form.invoiceFooter} onChange={set("invoiceFooter")} rows={3} className={ta}
          placeholder="Thank you for your membership! For queries, contact us at info@gym.lk" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Payment Terms</label>
        <textarea value={form.invoiceTerms} onChange={set("invoiceTerms")} rows={3} className={ta}
          placeholder="Payment is due within 7 days of invoice date. Late payments may incur fees." />
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
