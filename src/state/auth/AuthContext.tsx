import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { AuthTokens, AuthUser } from "../../types/auth";
import { getStoredTokens, removeStoredTokens, storeTokens } from "../../utils/authStorage";

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  useEffect(() => {
    const stored = getStoredTokens();
    if (stored) {
      setTokens(stored.tokens);
      setUser(stored.user);
    }
  }, []);

  const login = (nextUser: AuthUser, nextTokens: AuthTokens) => {
    setUser(nextUser);
    setTokens(nextTokens);
    storeTokens(nextUser, nextTokens);
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    removeStoredTokens();
  };

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(tokens),
      login,
      logout
    }),
    [user, tokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

