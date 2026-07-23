import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (token) {
      authApi.me()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, logout]);

  const login = async (phoneOrEmail, password) => {
    const isEmail = phoneOrEmail.includes('@');
    const credentials = {
      [isEmail ? 'email' : 'phone']: phoneOrEmail,
      password,
    };
    const res = await authApi.login(credentials);
    if (res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
    }
    return res;
  };

  const register = async (name, phoneOrEmail, password) => {
    const isEmail = phoneOrEmail.includes('@');
    const credentials = {
      name,
      [isEmail ? 'email' : 'phone']: phoneOrEmail,
      password,
    };
    const res = await authApi.register(credentials);
    if (res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
