"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell, LayoutDashboard, Users, CreditCard,
  Calendar, UserCheck, Apple, ShoppingBag,
  Lock, Wrench, Bell, BarChart3, Building2,
  LogOut, Settings, ChevronLeft, ChevronRight,
  Users2, Flame, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/app/providers";
import { useTheme } from "@/components/ThemeProvider";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Members",  href: "/members",  icon: Users },
      { label: "Groups",   href: "/groups",   icon: Users2 },
      { label: "Classes",  href: "/classes",  icon: Calendar },
      { label: "Trainers", href: "/trainers", icon: UserCheck },
    ],
  },
  {
    label: "HEALTH & FITNESS",
    items: [
      { label: "Workouts",      href: "/workouts",      icon: Dumbbell },
      { label: "Daily Workout", href: "/daily-workout", icon: Flame },
      { label: "Nutrition",     href: "/nutrition",     icon: Apple },
    ],
  },
  {
    label: "FACILITY",
    items: [
      { label: "Shop",      href: "/shop",      icon: ShoppingBag },
      { label: "Lockers",   href: "/lockers",   icon: Lock },
      { label: "Equipment", href: "/equipment", icon: Wrench },
    ],
  },
  {
    label: "BUSINESS",
    items: [
      { label: "Billing",  href: "/billing",  icon: CreditCard },
      { label: "Reports",  href: "/reports",  icon: BarChart3 },
      { label: "Branches", href: "/branches", icon: Building2 },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname    = usePathname();
  const { name, email, role, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  const displayName  = name  ?? email?.split("@")[0] ?? "Admin";
  const displayEmail = email ?? "user@powerhouse.lk";
  const displayRole  = role  ?? "STAFF";
  const initials     = displayName.charAt(0).toUpperCase();

  const tooltipCls = "absolute left-full ml-2.5 px-2.5 py-1.5 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl"
    + " bg-gray-900 text-white border border-white/10";

  return (
    <aside
      className="fixed inset-y-0 left-0 flex flex-col z-30 transition-all duration-300 overflow-hidden"
      style={{
        width:      collapsed ? "68px" : "240px",
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center h-16 px-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-600/25">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                PowerHouse
              </p>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400"
              >
                PRO
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "var(--bg-subtle)", color: "var(--text-muted)" }}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label} className="mb-1">
            {!collapsed && (
              <p
                className="px-3 pt-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </p>
            )}
            {collapsed && (
              <div className="my-2 mx-1" style={{ borderTop: "1px solid var(--border-subtle)" }} />
            )}
            {items.map(({ href, icon: Icon, label: itemLabel }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  title={collapsed ? itemLabel : undefined}
                  className={`
                    flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 group relative
                    ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5"}
                    ${active ? "bg-violet-600/20 text-violet-300 border border-violet-500/30" : ""}
                  `}
                  style={active ? {} : { color: "var(--text-muted)" }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)"; } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.background = ""; } }}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? "text-violet-400" : ""}`} />
                  {!collapsed && <span className="truncate leading-none">{itemLabel}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400/70" />
                  )}
                  {collapsed && (
                    <span className={tooltipCls}>{itemLabel}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-2 py-2 space-y-0.5"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        {/* Theme toggle */}
        {collapsed ? (
          <button
            onClick={toggle}
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="w-full flex items-center justify-center px-0 py-2.5 mx-1 rounded-xl transition-all group relative"
            style={{ color: "var(--text-muted)" }}
          >
            {isLight
              ? <Moon className="w-[18px] h-[18px] text-violet-400" />
              : <Sun  className="w-[18px] h-[18px] text-amber-400" />}
            <span className={tooltipCls}>{isLight ? "Dark Mode" : "Light Mode"}</span>
          </button>
        ) : (
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 transition-all"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--bg-subtle-md)" }}>
              {isLight
                ? <Moon className="w-4 h-4 text-violet-400" />
                : <Sun  className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold leading-none mb-0.5" style={{ color: "var(--text-secondary)" }}>
                {isLight ? "Dark Mode" : "Light Mode"}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {isLight ? "Switch to dark" : "Switch to light"}
              </p>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 relative ${isLight ? "bg-slate-300" : "bg-violet-600"}`}>
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isLight ? "left-0.5" : "left-4"}`} />
            </div>
          </button>
        )}

        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className="flex items-center gap-3 rounded-xl text-sm transition-all group relative"
          style={{ color: "var(--text-muted)", padding: collapsed ? "10px 0" : "10px 12px" }}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
          {collapsed && <span className={tooltipCls}>Settings</span>}
        </Link>

        <button
          onClick={() => logout()}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-sm transition-all group relative hover:text-red-400 hover:bg-red-500/10
            ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5"}`}
          style={{ color: "var(--text-muted)" }}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
          {collapsed && <span className={tooltipCls}>Sign Out</span>}
        </button>
      </div>

      {/* ── User Profile ──────────────────────────────────────────── */}
      <div
        className={`flex-shrink-0 transition-all ${collapsed ? "p-2" : "p-3"}`}
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div
          className={`flex items-center gap-3 rounded-xl transition-colors cursor-default ${collapsed ? "justify-center p-2" : "px-3 py-2.5"}`}
          style={{ background: "var(--bg-subtle)" }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-tight" style={{ color: "var(--text-primary)" }}>
                {displayName}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                {displayRole}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
