'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext({ user: null, isAuthenticated: false });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('yhq_token');
    if (token) {
      api.getProfile().then((data) => {
        setUser(data.user || data);
      }).catch(() => {
        localStorage.removeItem('yhq_token');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('yhq_token', res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email, password, name) => {
    const res = await api.register({ email, password, name });
    localStorage.setItem('yhq_token', res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch { /* ignore */ }
    localStorage.removeItem('yhq_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
