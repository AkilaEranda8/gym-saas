"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import {
  Dumbbell, Loader2, Eye, EyeOff, Mail, Lock,
  Users, BarChart3, Calendar, Zap, ChevronRight,
} from "lucide-react";

const FEATURES = [
  { icon: Users,     label: "Member Management",  desc: "Track every member's journey" },
  { icon: BarChart3, label: "Real-time Analytics", desc: "Revenue & attendance insights" },
  { icon: Calendar,  label: "Class Scheduling",    desc: "Manage bookings with ease"    },
  { icon: Zap,       label: "Smart Automation",    desc: "Reminders, billing & more"    },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [focused, setFocused]   = useState<"email" | "password" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0f0f14]">

      {/* ── Left branding panel ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        {/* gradient orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-900/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/40">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">PowerHouse</span>
        </div>

        {/* headline */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-300 text-xs font-medium">Gym Management Platform</span>
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
              Run your gym<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                smarter.
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              Everything you need to manage members, classes, billing, and staff — all in one place.
            </p>
          </div>

          {/* feature list */}
          <div className="grid grid-cols-1 gap-3 max-w-sm">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 group hover:bg-white/[0.06] transition-colors">
                <div className="w-9 h-9 bg-violet-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 ml-auto transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* footer stat strip */}
        <div className="relative z-10 flex items-center gap-8">
          {[["500+", "Gyms"], ["50K+", "Members"], ["99.9%", "Uptime"]].map(([val, lbl]) => (
            <div key={lbl}>
              <p className="text-white font-bold text-xl">{val}</p>
              <p className="text-gray-500 text-xs">{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#13131a] to-[#0f0f14]" />

        {/* mobile logo */}
        <div className="lg:hidden relative z-10 flex items-center gap-2 mb-10">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-base">PowerHouse</span>
        </div>

        <div className="relative z-10 w-full max-w-[380px] space-y-7">
          {/* heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to your gym dashboard</p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Username or Email</label>
              <div className={`flex items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3 transition-all ${
                focused === "email"
                  ? "border-violet-500 ring-1 ring-violet-500/30 bg-violet-500/5"
                  : "border-white/[0.08] hover:border-white/20"
              }`}>
                <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  placeholder="username or email"
                  className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className={`flex items-center gap-3 bg-white/[0.04] border rounded-xl px-4 py-3 transition-all ${
                focused === "password"
                  ? "border-violet-500 ring-1 ring-violet-500/30 bg-violet-500/5"
                  : "border-white/[0.08] hover:border-white/20"
              }`}>
                <Lock className="w-4 h-4 text-gray-500 shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/30 mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>
              ) : (
                <>Sign In<ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-gray-600 text-xs">New here?</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <a
            href="/register"
            className="flex items-center justify-center gap-2 w-full bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 text-gray-300 text-sm font-medium py-3 rounded-xl transition-all"
          >
            Register your gym
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </a>

          <p className="text-center text-gray-600 text-xs">
            By signing in you agree to our{" "}
            <a href="#" className="text-gray-500 hover:text-gray-300 underline underline-offset-2">Terms</a>
            {" & "}
            <a href="#" className="text-gray-500 hover:text-gray-300 underline underline-offset-2">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
