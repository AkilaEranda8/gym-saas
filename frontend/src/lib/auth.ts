"use client";

const KC_URL   = process.env.NEXT_PUBLIC_KEYCLOAK_URL    || "https://auth.hexalyte.com";
const KC_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM  || "Gym-Saas";
const KC_CLIENT = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "gym-app";

const TOKEN_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`;
const LOGOUT_URL = `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/logout`;

const KEYS = {
  access:  "gym_access_token",
  refresh: "gym_refresh_token",
  expiry:  "gym_token_expiry",
};

export interface TokenPayload {
  sub: string;
  email: string;
  preferred_username: string;
  realm_access?: { roles: string[] };
  attributes?: { gym_id?: string[] };
  exp: number;
}

function parseJwt(token: string): TokenPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function storeTokens(data: { access_token: string; refresh_token: string; expires_in: number }) {
  localStorage.setItem(KEYS.access, data.access_token);
  localStorage.setItem(KEYS.refresh, data.refresh_token);
  localStorage.setItem(KEYS.expiry, String(Date.now() + data.expires_in * 1000));
}

export async function login(username: string, password: string): Promise<void> {
  const body = new URLSearchParams({
    grant_type: "password",
    client_id: KC_CLIENT,
    username,
    password,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || "Invalid credentials");
  }
  storeTokens(await res.json());
}

export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const token   = localStorage.getItem(KEYS.access);
  const expiry  = Number(localStorage.getItem(KEYS.expiry) || 0);
  const refresh = localStorage.getItem(KEYS.refresh);

  if (!token) { console.debug('[auth] getAccessToken: no token'); return null; }

  if (Date.now() < expiry - 30_000) { console.debug('[auth] getAccessToken: returning fresh token'); return token; }
  console.debug('[auth] getAccessToken: token near-expiry, attempting refresh...');

  if (!refresh) { clearTokens(); return null; }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: KC_CLIENT,
    refresh_token: refresh,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) { clearTokens(); return null; }
  const data = await res.json();
  storeTokens(data);
  return data.access_token;
}

export function getTokenPayload(): TokenPayload | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(KEYS.access);
  return token ? parseJwt(token) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token  = localStorage.getItem(KEYS.access);
  const expiry = Number(localStorage.getItem(KEYS.expiry) || 0);
  const refresh = localStorage.getItem(KEYS.refresh);
  const result = !!token && (Date.now() < expiry - 30_000 || !!refresh);
  console.debug('[auth] isAuthenticated =', result, '| hasToken:', !!token, '| expiry:', new Date(expiry).toISOString(), '| fresh:', Date.now() < expiry - 30_000, '| hasRefresh:', !!refresh);
  return result;
}

export function clearTokens() {
  localStorage.removeItem(KEYS.access);
  localStorage.removeItem(KEYS.refresh);
  localStorage.removeItem(KEYS.expiry);
}

export async function logout() {
  const refresh = localStorage.getItem(KEYS.refresh);
  if (refresh) {
    const body = new URLSearchParams({
      client_id: KC_CLIENT,
      refresh_token: refresh,
    });
    await fetch(LOGOUT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }).catch(() => {});
  }
  clearTokens();
  window.location.href = "/login";
}
