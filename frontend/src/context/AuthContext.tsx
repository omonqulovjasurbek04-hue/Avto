import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, ApiUser, ApiError, getAccessToken, setTokens } from '../api/client';

interface AuthContextValue {
  user: ApiUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => setTokens(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await authApi.login(identifier, password);
    setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setUser(res.user);
  }, []);

  const register = useCallback(async (name: string, identifier: string, password: string) => {
    const res = await authApi.register(name, identifier, password);
    setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {
      // best-effort server-side revocation; client-side logout must proceed regardless
    });
    setTokens(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
