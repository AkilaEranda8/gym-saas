"use client";
import React from "react";
import { Loader2, Save } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
  dirty?: boolean;
}

export default function SettingSection({ title, description, children, onSave, saving, dirty }: Props) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#1e293b]">
        <h3 className="text-sm font-semibold text-[#e2e8f0]">{title}</h3>
        {description && <p className="text-xs text-[#475569] mt-0.5">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
      {onSave && (
        <div className="px-6 pb-5 flex items-center justify-between">
          {dirty && <span className="text-xs text-[#f59e0b]">Unsaved changes</span>}
          {!dirty && <span className="text-xs text-[#475569]">All changes saved</span>}
          <button
            onClick={onSave}
            disabled={saving || !dirty}
            className="flex items-center gap-2 px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
