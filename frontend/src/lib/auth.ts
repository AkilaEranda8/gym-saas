"use client";

const KC_URL    = process.env.NEXT_PUBLIC_KEYCLOAK_URL       || "https://auth.hexalyte.com";
const KC_REALM  = process.env.NEXT_PUBLIC_KEYCLOAK_REALM     || "Gym-Saas";
const KC_CLIENT = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "gym-app";

const TOKEN_URL  = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`;
const LOGOUT_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/logout`;

// ─── AuthUser ────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;       // OWNER | ADMIN | STAFF | CASHIER
  tenantId: string;
  branchIds: string[];
  avatar?: string;
}

// ─── authStorage ─────────────────────────────────────────────────────────────
export const authStorage = {
  getAccessToken:  () => localStorage.getItem("hx_access_token"),
  getRefreshToken: () => localStorage.getItem("hx_refresh_token"),
  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem("hx_user");
    return raw ? JSON.parse(raw) : null;
  },
  save: (accessToken: string, refreshToken: string, user: AuthUser) => {
    localStorage.setItem("hx_access_token", accessToken);
    localStorage.setItem("hx_refresh_token", refreshToken);
    localStorage.setItem("hx_user", JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem("hx_access_token");
    localStorage.removeItem("hx_refresh_token");
    localStorage.removeItem("hx_user");
  },
  isLoggedIn: () => !!localStorage.getItem("hx_access_token"),
};

// ─── Internal JWT helpers ─────────────────────────────────────────────────────
export interface TokenPayload {
  sub: string;
  email: string;
  preferred_username: string;
  name?: string;
  given_name?: string;
  realm_access?: { roles: string[] };
  attributes?: { gym_id?: string[]; branch_ids?: string[] };
  exp: number;
}

function parseJwt(token: string): TokenPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function resolveRole(roles: string[]): string {
  if (roles.includes("GYM_OWNER") || roles.includes("OWNER")) return "OWNER";
  if (roles.includes("ADMIN"))   return "ADMIN";
  if (roles.includes("TRAINER")) return "STAFF";
  if (roles.includes("CASHIER")) return "CASHIER";
  return "STAFF";
}

function buildUser(payload: TokenPayload): AuthUser {
  const roles = payload.realm_access?.roles ?? [];
  return {
    id:        payload.sub,
    email:     payload.email ?? payload.preferred_username,
    name:      payload.name ?? payload.given_name ?? payload.preferred_username,
    role:      resolveRole(roles),
    tenantId:  payload.attributes?.gym_id?.[0] ?? "",
    branchIds: payload.attributes?.branch_ids ?? [],
  };
}

// ─── Keycloak token exchange ──────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<void> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id:  KC_CLIENT,
    username,
    password,
  });
  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || "Invalid credentials");
  }
  const data = await res.json();
  const payload = parseJwt(data.access_token);
  if (!payload) throw new Error("Invalid token received");
  authStorage.save(data.access_token, data.refresh_token, buildUser(payload));
}

export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const token   = authStorage.getAccessToken();
  const refresh = authStorage.getRefreshToken();

  if (!token) return null;

  const payload = parseJwt(token);
  const expiry  = payload ? payload.exp * 1000 : 0;

  if (Date.now() < expiry - 30_000) return token;

  if (!refresh) { authStorage.clear(); return null; }

  const body = new URLSearchParams({
    grant_type:    "refresh_token",
    client_id:     KC_CLIENT,
    refresh_token: refresh,
  });
  const res = await fetch(TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });
  if (!res.ok) { authStorage.clear(); return null; }
  const data = await res.json();
  const newPayload = parseJwt(data.access_token);
  if (!newPayload) { authStorage.clear(); return null; }
  authStorage.save(data.access_token, data.refresh_token, buildUser(newPayload));
  return data.access_token;
}

export function getTokenPayload(): TokenPayload | null {
  if (typeof window === "undefined") return null;
  const token = authStorage.getAccessToken();
  return token ? parseJwt(token) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return authStorage.isLoggedIn();
}

export function clearTokens() {
  authStorage.clear();
}

export async function logout() {
  const refresh = authStorage.getRefreshToken();
  if (refresh) {
    const body = new URLSearchParams({ client_id: KC_CLIENT, refresh_token: refresh });
    await fetch(LOGOUT_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    body.toString(),
    }).catch(() => {});
  }
  authStorage.clear();
  window.location.href = "/login";
}
