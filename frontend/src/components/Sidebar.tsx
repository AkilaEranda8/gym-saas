"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dumbbell, LayoutDashboard, Users, CreditCard,
  Calendar, UserCheck, Apple, ShoppingBag,
  Lock, Wrench, Bell, BarChart3, Building2,
  LogOut, Settings, ChevronLeft, ChevronRight,
  Users2, Flame, Search, Sun, Moon,
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
  const pathname = usePathname();
  const { email, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  const initials = email ? email.charAt(0).toUpperCase() : "U";
  const displayEmail = email ?? "user@powerhouse.lk";

  const bg          = isLight ? "bg-white"            : "bg-[#111827]";
  const border      = isLight ? "border-gray-200"     : "border-gray-800/60";
  const textMuted   = isLight ? "text-gray-500"       : "text-gray-400";
  const textBody    = isLight ? "text-gray-700"       : "text-gray-300";
  const textStrong  = isLight ? "text-gray-900"       : "text-white";
  const textLabel   = isLight ? "text-gray-400"       : "text-gray-600";
  const hoverBg     = isLight ? "hover:bg-gray-100"   : "hover:bg-gray-800/80";
  const hoverText   = isLight ? "hover:text-gray-900" : "hover:text-white";
  const iconColor   = isLight ? "text-gray-400"       : "text-gray-500";
  const iconHover   = isLight ? "group-hover:text-gray-700" : "group-hover:text-gray-300";
  const divider     = isLight ? "border-gray-200"     : "border-gray-800/80";
  const searchBg    = isLight ? "bg-gray-100 border-gray-200"        : "bg-gray-800/70 border-gray-700/50";
  const toggleBtnBg = isLight ? "bg-gray-200 hover:bg-gray-300"      : "bg-gray-800 hover:bg-gray-700";
  const toggleBtnTx = isLight ? "text-gray-500 hover:text-gray-800"  : "text-gray-400 hover:text-white";
  const profileBg   = isLight ? "bg-gray-100 hover:bg-gray-200"      : "bg-gray-800/50 hover:bg-gray-800";
  const tooltipCls  = "absolute left-full ml-2.5 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-gray-700 shadow-xl";

  return (
    <aside
      className={`fixed inset-y-0 left-0 flex flex-col z-30 ${bg} border-r ${border} transition-all duration-300 overflow-hidden`}
      style={{ width: collapsed ? "68px" : "240px" }}
    >
      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div className={`flex items-center h-16 px-3 border-b ${border} flex-shrink-0`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className={`font-bold ${textStrong} text-sm leading-tight truncate`}>PowerHouse</p>
              <p className="text-[11px] text-gray-500 truncate">Gym Management</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`flex-shrink-0 w-7 h-7 rounded-lg ${toggleBtnBg} flex items-center justify-center ${toggleBtnTx} transition-colors`}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft  className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Search ────────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <div className={`flex items-center gap-2 ${searchBg} border rounded-xl px-3 py-2`}>
            <Search className={`w-3.5 h-3.5 ${textMuted} flex-shrink-0`} />
            <span className={`${textMuted} text-sm`}>Search...</span>
          </div>
        </div>
      )}

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5 scrollbar-thin ${isLight ? "scrollbar-thumb-gray-300" : "scrollbar-thumb-gray-800"}`}>
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label} className="mb-1">
            {!collapsed && (
              <p className={`px-3 pt-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] ${textLabel} uppercase`}>
                {label}
              </p>
            )}
            {collapsed && <div className={`my-2 mx-2 border-t ${divider}`} />}
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
                    ${active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : `${textMuted} ${hoverText} ${hoverBg}`}
                  `}
                >
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? "text-white" : `${iconColor} ${iconHover}`}`} />
                  {!collapsed && <span className="truncate leading-none">{itemLabel}</span>}
                  {!collapsed && active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
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
      <div className={`flex-shrink-0 border-t ${border} px-2 py-2 space-y-0.5`}>

        {/* Theme toggle */}
        {collapsed ? (
          <button
            onClick={toggle}
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className={`w-full flex items-center justify-center px-0 py-2.5 mx-1 rounded-xl ${textMuted} ${hoverText} ${hoverBg} transition-all group relative`}
          >
            {isLight
              ? <Moon className="w-[18px] h-[18px] text-blue-500" />
              : <Sun  className="w-[18px] h-[18px] text-amber-400" />}
            <span className={tooltipCls}>
              {isLight ? "Dark Mode" : "Light Mode"}
            </span>
          </button>
        ) : (
          <button
            onClick={toggle}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 transition-all group border ${isLight ? "bg-slate-50 border-gray-200 hover:bg-gray-100" : "bg-slate-800/50 border-gray-700/30 hover:bg-slate-800/80"}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? "bg-slate-200" : "bg-gray-700"}`}>
              {isLight
                ? <Moon className="w-4 h-4 text-blue-500" />
                : <Sun  className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="flex-1 text-left">
              <p className={`text-xs font-semibold leading-none mb-0.5 ${textBody}`}>
                {isLight ? "Dark Mode" : "Light Mode"}
              </p>
              <p className={`text-[10px] text-gray-500`}>
                {isLight ? "Switch to dark" : "Switch to light"}
              </p>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 relative ${isLight ? "bg-slate-300" : "bg-blue-600"}`}>
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${isLight ? "left-0.5" : "left-4"}`} />
            </div>
          </button>
        )}

        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-3 rounded-xl text-sm ${textMuted} ${hoverText} ${hoverBg} transition-all group relative
            ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5"}`}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
          {collapsed && <span className={tooltipCls}>Settings</span>}
        </Link>

        <button
          onClick={() => logout()}
          title={collapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-sm ${textMuted} hover:text-red-500 hover:bg-red-500/10 transition-all group relative
            ${collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5"}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
          {collapsed && <span className={tooltipCls}>Sign Out</span>}
        </button>
      </div>

      {/* ── User Profile ──────────────────────────────────────────── */}
      <div className={`flex-shrink-0 border-t ${border} transition-all ${collapsed ? "p-2" : "p-3"}`}>
        <div className={`flex items-center gap-3 rounded-xl ${profileBg} transition-colors cursor-default ${collapsed ? "justify-center p-2" : "px-3 py-2.5"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold ${textStrong} truncate leading-tight`}>Admin</p>
              <p className="text-[11px] text-gray-500 truncate">{displayEmail}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
