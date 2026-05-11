"use client";

import { Bell, Search, ChevronDown, Sun, Moon } from "lucide-react";
import { useAuth } from "@/app/providers";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { email, roles } = useAuth();
  const { theme, toggle } = useTheme();

  const initials = email ? email.charAt(0).toUpperCase() : "G";
  const topRole  = roles.includes("GYM_OWNER") ? "Gym Owner"
    : roles.includes("MANAGER")  ? "Manager"
    : roles.includes("TRAINER")  ? "Trainer"
    : "Member";

  return (
    <header className="h-16 bg-[#111827] border-b border-gray-800/60 px-6 flex items-center justify-between sticky top-0 z-20">

      {/* Left — page title */}
      <div>
        <h1 className="text-[15px] font-semibold text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search…"
            className="bg-gray-800/70 border border-gray-700/60 text-sm text-gray-300 placeholder-gray-600 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/60 focus:border-blue-500/60 w-48 transition-all"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800/70 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          {theme === "dark"
            ? <Sun  className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4 text-blue-400"  />
          }
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800/70 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#111827]" />
        </Link>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700/60 mx-1" />

        {/* User pill */}
        <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-800/70 border border-gray-700/50 hover:bg-gray-700/80 transition-colors group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
              {email?.split("@")[0] ?? "Admin"}
            </p>
            <p className="text-[10px] text-gray-500 leading-tight">{topRole}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors hidden md:block" />
        </button>

      </div>
    </header>
  );
}
