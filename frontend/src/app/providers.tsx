"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getTokenPayload, isAuthenticated, logout, type TokenPayload } from "@/lib/auth";
import { Dumbbell, Loader2 } from "lucide-react";

interface AuthCtx {
  authenticated: boolean;
  token?: string;
  userId?: string;
  email?: string;
  roles: string[];
  hasRole: (r: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  authenticated: false,
  roles: [],
  hasRole: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const routerRef = useRef(router);
  const [ready, setReady]   = useState(false);
  const [token, setToken]   = useState<string | undefined>();
  const [payload, setPayload] = useState<TokenPayload | null>(null);

  useEffect(() => { routerRef.current = router; }, [router]);

  useEffect(() => {
    let mounted = true;
    console.debug('[AuthProvider] effect running, mounted:', mounted);
    if (!isAuthenticated()) {
      console.debug('[AuthProvider] not authenticated → redirect /login');
      routerRef.current.replace("/login");
      return;
    }
    getAccessToken()
      .then((t) => {
        if (!mounted) { console.debug('[AuthProvider] unmounted, ignoring token result'); return; }
        if (!t) { console.debug('[AuthProvider] getAccessToken returned null → redirect /login'); routerRef.current.replace("/login"); return; }
        console.debug('[AuthProvider] token OK → setReady(true)');
        setToken(t);
        setPayload(getTokenPayload());
        setReady(true);
      })
      .catch((e) => {
        if (!mounted) return;
        console.debug('[AuthProvider] getAccessToken threw:', e, '→ redirect /login');
        routerRef.current.replace("/login");
      });
    return () => { console.debug('[AuthProvider] cleanup: mounted = false'); mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      </div>
    );
  }

  const roles = payload?.realm_access?.roles ?? [];
  const value: AuthCtx = {
    authenticated: true,
    token,
    userId:  payload?.sub,
    email:   payload?.email,
    roles,
    hasRole: (r) => roles.includes(r),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
