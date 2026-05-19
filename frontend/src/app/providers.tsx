"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, authStorage, logout, type AuthUser } from "@/lib/auth";
import { Dumbbell, Loader2 } from "lucide-react";

interface AuthCtx {
  authenticated: boolean;
  token?: string;
  user: AuthUser | null;
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  tenantId?: string;
  roles: string[];
  hasRole: (r: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  authenticated: false,
  user: null,
  roles: [],
  hasRole: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router    = useRouter();
  const routerRef = useRef(router);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [user,  setUser]  = useState<AuthUser | null>(null);

  useEffect(() => { routerRef.current = router; }, [router]);

  useEffect(() => {
    let mounted = true;
    if (!authStorage.isLoggedIn()) {
      routerRef.current.replace("/login");
      return;
    }
    getAccessToken()
      .then((t) => {
        if (!mounted) return;
        if (!t) { routerRef.current.replace("/login"); return; }
        setToken(t);
        setUser(authStorage.getUser());
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        routerRef.current.replace("/login");
      });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/30">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      </div>
    );
  }

  const roleArray = user?.role ? [user.role] : [];
  const value: AuthCtx = {
    authenticated: true,
    token,
    user,
    userId:   user?.id,
    email:    user?.email,
    name:     user?.name,
    role:     user?.role,
    tenantId: user?.tenantId,
    roles:    roleArray,
    hasRole:  (r) => roleArray.includes(r),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
