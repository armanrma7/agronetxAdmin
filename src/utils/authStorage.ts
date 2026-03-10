import { AuthTokens, AuthUser } from "../types/auth";

const STORAGE_KEY = "agronetx_admin_auth";

interface StoredAuth {
  user: AuthUser;
  tokens: AuthTokens;
}

export const getStoredTokens = (): StoredAuth | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
};

export const storeTokens = (user: AuthUser, tokens: AuthTokens) => {
  const payload: StoredAuth = { user, tokens };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const removeStoredTokens = () => {
  localStorage.removeItem(STORAGE_KEY);
};

