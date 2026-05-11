"use client";
import React, { useState } from "react";
import { Loader2, Bell } from "lucide-react";
import { SettingsByCategoryDTO, useUpdateSettingsKV } from "@/hooks/useSettings";
import toast from "react-hot-toast";
import SettingRow from "./SettingRow";

interface Props { categoryData: SettingsByCategoryDTO | undefined; onUpdated: () => void; }

export default function NotificationsPanel({ categoryData, onUpdated }: Props) {
  const { mutate, saving } = useUpdateSettingsKV();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries((categoryData?.settings ?? []).map(s => [s.key, s.value ?? ""]))
  );
  const [dirty, setDirty] = useState(false);

  const toggle = (key: string) => {
    setValues(p => ({ ...p, [key]: p[key] === "true" ? "false" : "true" }));
    setDirty(true);
  };

  const setVal = (key: string, val: string) => {
    setValues(p => ({ ...p, [key]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await mutate(values);
      onUpdated();
      setDirty(false);
      toast.success("Notification settings saved");
    } catch { toast.error("Failed to save"); }
  };

  const Switch = ({ k }: { k: string }) => (
    <button onClick={() => toggle(k)}
      className={`relative w-10 h-5 rounded-full transition-colors ${values[k] === "true" ? "bg-[#f59e0b]" : "bg-[#1e293b]"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${values[k] === "true" ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  return (
    <div className="space-y-1">
      <SettingRow label="WhatsApp Notifications" description="Send member alerts via WhatsApp">
        <Switch k="whatsapp.enabled" />
      </SettingRow>
      <SettingRow label="SMS Notifications" description="Send alerts via Dialog SMS">
        <Switch k="sms.enabled" />
      </SettingRow>
      <SettingRow label="Email Notifications" description="Send alerts via email">
        <Switch k="email.enabled" />
      </SettingRow>
      <SettingRow label="Push Notifications" description="Mobile app push notifications">
        <Switch k="push.enabled" />
      </SettingRow>
      <SettingRow label="Quiet Hours Start" description="No notifications sent before this time">
        <input type="time" value={values["quiet.hours.start"] ?? "22:00"}
          onChange={e => setVal("quiet.hours.start", e.target.value)}
          className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] w-full" />
      </SettingRow>
      <SettingRow label="Quiet Hours End" description="No notifications sent after this time">
        <input type="time" value={values["quiet.hours.end"] ?? "07:00"}
          onChange={e => setVal("quiet.hours.end", e.target.value)}
          className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#f59e0b] w-full" />
      </SettingRow>
      <div className="flex items-center justify-between pt-4">
        {dirty ? <span className="text-xs text-[#f59e0b]">Unsaved changes</span> : <span className="text-xs text-[#475569]">All changes saved</span>}
        <button onClick={handleSave} disabled={saving || !dirty}
          className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
          Save
        </button>
      </div>
    </div>
  );
}
