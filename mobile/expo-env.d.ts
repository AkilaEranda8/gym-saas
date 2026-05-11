declare global {
  // eslint-disable-next-line no-var
  var process: {
    env: Record<string, string | undefined> & {
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_KEYCLOAK_URL?: string;
      EXPO_PUBLIC_KEYCLOAK_REALM?: string;
      EXPO_PUBLIC_KEYCLOAK_CLIENT_ID?: string;
    };
  };
}

export {};
