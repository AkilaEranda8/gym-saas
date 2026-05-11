"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { GymSettingsDTO, useUpdateGymSettings } from "@/hooks/useSettings";
import toast from "react-hot-toast";

const inp = "w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#f59e0b] transition-colors";

const SL_DISTRICTS = [
  "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha",
  "Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala",
  "Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa",
  "Puttalam","Ratnapura","Trincomalee","Vavuniya",
];

interface Props { settings: GymSettingsDTO; onSaved: (s: GymSettingsDTO) => void; }

export default function AddressForm({ settings, onSaved }: Props) {
  const { mutate, saving } = useUpdateGymSettings();
  const [form, setForm] = useState({
    addressLine1: settings.addressLine1 ?? "",
    addressLine2: settings.addressLine2 ?? "",
    city: settings.city ?? "",
    district: settings.district ?? "",
    postalCode: settings.postalCode ?? "",
    googleMapsUrl: settings.googleMapsUrl ?? "",
    businessRegNo: settings.businessRegNo ?? "",
    taxNo: settings.taxNo ?? "",
  });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm({
      addressLine1: settings.addressLine1 ?? "",
      addressLine2: settings.addressLine2 ?? "",
      city: settings.city ?? "",
      district: settings.district ?? "",
      postalCode: settings.postalCode ?? "",
      googleMapsUrl: settings.googleMapsUrl ?? "",
      businessRegNo: settings.businessRegNo ?? "",
      taxNo: settings.taxNo ?? "",
    });
    setDirty(false);
  }, [settings]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      const saved = await mutate({ ...settings, ...form });
      if (saved) { onSaved(saved); toast.success("Address saved"); setDirty(false); }
    } catch { toast.error("Failed to save"); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Address Line 1</label>
        <input value={form.addressLine1} onChange={set("addressLine1")} className={inp} placeholder="123, Main Street" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Address Line 2</label>
        <input value={form.addressLine2} onChange={set("addressLine2")} className={inp} placeholder="Apt / Suite / Floor" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">City</label>
          <input value={form.city} onChange={set("city")} className={inp} placeholder="Colombo" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">District</label>
          <select value={form.district} onChange={set("district")}
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b]">
            <option value="">Select district</option>
            {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Postal Code</label>
          <input value={form.postalCode} onChange={set("postalCode")} className={inp} placeholder="00100" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">Business Reg. No.</label>
          <input value={form.businessRegNo} onChange={set("businessRegNo")} className={inp} placeholder="PV 12345" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#475569] mb-1">VAT/TIN No.</label>
          <input value={form.taxNo} onChange={set("taxNo")} className={inp} placeholder="TAX-12345678" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#475569] mb-1">Google Maps URL</label>
        <input value={form.googleMapsUrl} onChange={set("googleMapsUrl")} className={inp} placeholder="https://maps.google.com/..." />
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
