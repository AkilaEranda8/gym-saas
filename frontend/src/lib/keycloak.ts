import Keycloak from "keycloak-js";

let _instance: Keycloak | null = null;

function kc(): Keycloak {
  if (!_instance) {
    _instance = new Keycloak({
      url:      process.env.NEXT_PUBLIC_KEYCLOAK_URL       || "http://localhost:8080",
      realm:    process.env.NEXT_PUBLIC_KEYCLOAK_REALM     || "Gym-Saas",
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "gym-app",
    });
  }
  return _instance;
}

export function getKeycloakInstance(): Keycloak {
  return kc();
}

export async function initKeycloak(): Promise<boolean> {
  try {
    const authenticated = await kc().init({
      onLoad:                    "check-sso",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      checkLoginIframe:          false,
      pkceMethod:                "S256",
    });
    return authenticated;
  } catch (err) {
    console.error("Keycloak init failed:", err);
    return false;
  }
}

export function login() {
  kc().login({ redirectUri: window.location.origin + "/dashboard" });
}

export function logout() {
  kc().logout({ redirectUri: window.location.origin });
}

export async function getToken(): Promise<string | undefined> {
  try {
    await kc().updateToken(30);
    return kc().token;
  } catch {
    kc().login();
    return undefined;
  }
}

export function getUserRoles(): string[] {
  return kc().realmAccess?.roles ?? [];
}

export function hasRole(role: string): boolean {
  return getUserRoles().includes(role);
}

export default { getKeycloakInstance, initKeycloak, login, logout, getToken, getUserRoles, hasRole };
