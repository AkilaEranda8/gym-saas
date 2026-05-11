"use client";
import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon?: React.ReactNode;
  color?: "gold" | "green" | "blue" | "red" | "purple";
  prefix?: string;
  suffix?: string;
}

const colorMap = {
  gold:   "text-yellow-400 bg-yellow-400/10",
  green:  "text-emerald-400 bg-emerald-400/10",
  blue:   "text-blue-400 bg-blue-400/10",
  red:    "text-red-400 bg-red-400/10",
  purple: "text-purple-400 bg-purple-400/10",
};

export default function KpiCard({
  title, value, subtitle, growth, icon, color = "gold", prefix, suffix,
}: KpiCardProps) {
  const colorCls = colorMap[color];
  const hasGrowth = growth !== undefined && growth !== null;
  const positive  = (growth ?? 0) > 0;
  const neutral   = (growth ?? 0) === 0;

  return (
    <div className="bg-[#111827] border border-white/5 rounded-xl p-5 flex flex-col gap-3 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        {icon && (
          <div className={`p-2 rounded-lg ${colorCls}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end gap-1">
        {prefix && <span className="text-sm text-gray-500 mb-1">{prefix}</span>}
        <span className="text-2xl font-bold text-white tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-sm text-gray-500 mb-1">{suffix}</span>}
      </div>

      <div className="flex items-center gap-2 min-h-[20px]">
        {hasGrowth && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            neutral  ? "text-gray-400 bg-gray-400/10" :
            positive ? "text-emerald-400 bg-emerald-400/10" :
                       "text-red-400 bg-red-400/10"
          }`}>
            {neutral  ? <Minus className="w-3 h-3" /> :
             positive ? <TrendingUp className="w-3 h-3" /> :
                        <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth!).toFixed(1)}%
          </span>
        )}
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
}
