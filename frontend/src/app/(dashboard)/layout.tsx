"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/app/providers";
import Sidebar from "@/components/Sidebar";
import { useTheme } from "@/components/ThemeProvider";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { authenticated } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      router.replace("/");
    }
  }, [authenticated, router]);

  if (!authenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: collapsed ? "68px" : "240px" }}
      >
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedLayout>{children}</ProtectedLayout>
    </AuthProvider>
  );
}
