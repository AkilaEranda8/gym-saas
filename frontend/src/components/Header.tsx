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
  const { name, email, role } = useAuth();
  const { theme, toggle } = useTheme();

  const displayName = name ?? email?.split("@")[0] ?? "Admin";
  const initials    = displayName.charAt(0).toUpperCase();
  const displayRole = role ?? "STAFF";

  return (
    <header
      className="h-16 px-6 flex items-center justify-between sticky top-0 z-20"
      style={{
        background:   "var(--bg-card)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* Left — page title */}
      <div>
        <h1 className="text-[15px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search…"
            className="text-sm pl-9 pr-4 py-2 rounded-xl w-48 transition-all outline-none"
            style={{
              background:  "var(--bg-subtle)",
              border:      "1px solid var(--border-default)",
              color:       "var(--text-primary)",
            }}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}
        >
          {theme === "dark"
            ? <Sun  className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4 text-violet-500" />
          }
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
          style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)", color: "var(--text-muted)" }}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </Link>

        {/* Divider */}
        <div className="w-px h-6 mx-1" style={{ background: "var(--border-default)" }} />

        {/* User pill */}
        <button
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors group"
          style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold leading-tight truncate max-w-[100px]" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </p>
            <p className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>{displayRole}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: "var(--text-muted)" }} />
        </button>

      </div>
    </header>
  );
}
