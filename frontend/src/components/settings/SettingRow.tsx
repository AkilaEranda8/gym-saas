"use client";
import React from "react";

interface Props {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export default function SettingRow({ label, description, children }: Props) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[#1e293b] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e2e8f0]">{label}</p>
        {description && <p className="text-xs text-[#475569] mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0 w-56">{children}</div>
    </div>
  );
}
