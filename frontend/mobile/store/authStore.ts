import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api, { setStoredTokens, clearStoredTokens } from '../services/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN';
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  restore: () => Promise<void>;
  /** identifier can be an email address or a phone number */
  login: (identifier: string, password: string) => Promise<void>;
  /** identifier can be an email address or a phone number */
  register: (name: string, identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  restore: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) {
      set({ user: null, isLoading: false });
      return;
    }
    try {
      const res = await api.get('/users/me');
      set({ user: res.data.user, isLoading: false });
    } catch {
      await clearStoredTokens();
      set({ user: null, isLoading: false });
    }
  },

  login: async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    await setStoredTokens(res.data.accessToken, res.data.refreshToken);
    set({ user: res.data.user });
  },

  register: async (name, identifier, password) => {
    const isEmail = identifier.includes('@');
    const res = await api.post('/auth/register', {
      name,
      password,
      email: isEmail ? identifier : undefined,
      phone: isEmail ? undefined : identifier,
    });
    await setStoredTokens(res.data.accessToken, res.data.refreshToken);
    set({ user: res.data.user });
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // best-effort server-side revocation; client-side logout must proceed regardless
    }
    await clearStoredTokens();
    set({ user: null });
  },
}));
