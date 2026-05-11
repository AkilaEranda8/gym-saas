"use client";

import { LucideIcon, Wrench } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export default function ComingSoon({ title, description, icon: Icon = Wrench }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-gray-400 text-sm max-w-xs">
        {description ?? "This section is under active development and will be available soon."}
      </p>
      <div className="mt-6 flex gap-2 flex-wrap justify-center">
        <span className="badge badge-blue">In Development</span>
        <span className="badge badge-gray">API Ready</span>
      </div>
    </div>
  );
}
